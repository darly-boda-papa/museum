const DEFAULT_API_BASE_URL = "https://api.kcisa.kr";
const API_PATH = "/openapi/service/CNV/API_CNV_042/request";

function normalizeText(value) {
  if (value == null) return "";
  return String(value).trim();
}

function parseJsonItems(payload) {
  if (!payload || typeof payload !== "object") return [];
  const response = payload.response || payload;
  const body = response.body || response;
  const items = body.items || {};
  const itemList = items.item || items;
  if (Array.isArray(itemList)) return itemList;
  if (itemList && typeof itemList === "object") return [itemList];
  return [];
}

function parseXmlItems(xmlText) {
  const itemBlocks = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
  const fields = [
    "title",
    "creater",
    "charge",
    "period",
    "spatialCoverage",
    "imageObject",
    "description",
    "url",
    "contactPoint",
    "collectionDb",
  ];

  const readTag = (block, tag) => {
    const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
    return normalizeText(match ? match[1] : "");
  };

  return itemBlocks.map((block) => {
    const item = {};
    for (const field of fields) {
      item[field] = readTag(block, field);
    }
    return item;
  });
}

function toSafeEvent(item) {
  return {
    title: normalizeText(item.title),
    creater: normalizeText(item.creater),
    charge: normalizeText(item.charge),
    period: normalizeText(item.period),
    spatialCoverage: normalizeText(item.spatialCoverage),
    imageObject: normalizeText(item.imageObject),
    description: normalizeText(item.description),
    url: normalizeText(item.url),
    contactPoint: normalizeText(item.contactPoint),
    collectionDb: normalizeText(item.collectionDb),
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.VITE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing VITE_API_KEY environment variable" });
  }

  const apiBaseUrl = (process.env.API_BASE_URL || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, "");

  const params = new URLSearchParams({
    serviceKey: apiKey,
    numOfRows: "50",
    pageNo: "1",
    collectionDb: "전시",
    format: "json",
  });

  const requestUrl = `${apiBaseUrl}${API_PATH}?${params.toString()}`;

  try {
    const upstream = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json, text/xml;q=0.9, application/xml;q=0.8, */*;q=0.7",
      },
    });

    if (!upstream.ok) {
      const bodyText = await upstream.text();
      return res.status(upstream.status).json({
        error: "Upstream API request failed",
        status: upstream.status,
        details: bodyText.slice(0, 300),
      });
    }

    const contentType = upstream.headers.get("content-type") || "";
    const raw = await upstream.text();

    let items = [];
    if (contentType.includes("application/json") || raw.trim().startsWith("{")) {
      const parsed = JSON.parse(raw);
      items = parseJsonItems(parsed);
    } else {
      items = parseXmlItems(raw);
    }

    const safeEvents = items
      .map(toSafeEvent)
      .filter((event) => event.title && event.creater);

    return res.status(200).json({ total: safeEvents.length, events: safeEvents });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCause = error && typeof error === "object" && "cause" in error ? String(error.cause) : "";
    return res.status(500).json({
      error: "Failed to fetch museum events",
      details: errorMessage,
      requestUrl: `${apiBaseUrl}${API_PATH}`,
      cause: errorCause || undefined,
    });
  }
}
