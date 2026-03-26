# 국립박물관 전시 정보

국립지방박물관 통합 전시 정보 API를 활용한 박물관 전시 정보 웹사이트입니다.

## ⚠️ 중요 사항

현재는 `/api/events` 서버리스 함수가 외부 공공 API를 대신 호출합니다.
- 프론트엔드에는 API 키가 노출되지 않습니다.
- Vercel 배포 시 환경 변수(`VITE_API_KEY`)를 설정하면 동작합니다.
- 공공 API 도메인 변경 시 `API_BASE_URL`만 바꾸면 코드 수정 없이 대응할 수 있습니다.

## 기능

- 전국 국립박물관의 전시 정보 조회
- 무료/유료 필터링
- 박물관별 필터링
- 반응형 디자인 (모바일/태블릿/데스크탑)

## 로컬 실행 (샘플 데이터)

로컬에서 정적 파일 + 서버리스 함수 동작을 함께 확인하려면:
```bash
vercel dev
```

> 참고: `vercel dev`는 로컬에서 `/api/events` 엔드포인트를 실행합니다.

## Vercel 배포 (실제 API 연동)

### 방법 1: Vercel 웹사이트에서 배포 (권장)

1. **Vercel 계정 생성**
   - https://vercel.com 접속
   - GitHub, GitLab, 또는 Bitbucket 계정으로 가입

2. **새 프로젝트 생성**
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 import (없으면 생성 후 import)

3. **환경 변수 설정**
   - Environment Variables 섹션에 추가:
     - NAME: `VITE_API_KEY`
     - VALUE: 발급받은 공공 API 키
     - (선택) NAME: `API_BASE_URL`
     - (선택) VALUE: 기본값 `https://api.kcisa.kr` (도메인 변경 시 새 베이스 URL 입력)

4. **배포**
   - "Deploy" 버튼 클릭
   - 1-2분 후 배포 완료

5. **실제 API 적용**
   - 배포된 URL 접속
   - 샘플 데이터 대신 실제 API 데이터가 표시됨

### 방법 2: Vercel CLI 사용

1. Vercel CLI 설치 (npm이 필요)
```bash
npm install -g vercel
```

2. Vercel에 로그인
```bash
vercel login
```

3. 프로젝트 배포
```bash
vercel
```

4. 환경 변수 설정:
```bash
vercel env add VITE_API_KEY
# 값: 발급받은 공공 API 키
vercel env add API_BASE_URL
# 값: https://api.kcisa.kr (기본값과 동일하면 생략 가능)
```

5. 재배포
```bash
vercel --prod
```

## 파일 구조

```
museum_01/
├── index.html          # 메인 페이지 (실제 API 데이터 표시)
├── api/events.js       # Vercel 서버리스 API 프록시
├── .env                # API 키 (로컬용, Git에 커밋 안 됨)
├── .env.example        # API 키 예시
├── .gitignore          # Git 무시 파일
├── vercel.json         # Vercel 배포 설정
├── README.md           # 설명서 (이 파일)
└── proxy_server.py     # CORS 프록시 서버 (선택사항)
```

## 로컬에서 실제 API 테스트

```bash
vercel dev
```

그 후 `http://localhost:3000`에서 확인합니다.

## API 정보

- **API URL**: https://api.kcisa.kr/openapi/service/CNV/API_CNV_042/request
- **제공기관**: 국립경주박물관, 국립중앙박물관, 국립대구박물관
- **데이터**: 국립지방박물관 13개 기관의 전시 정보

## 보안 주의사항

- `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
- API 키는 코드에 하드코딩하지 말고 Vercel 환경 변수에만 저장하세요
- 프론트는 외부 API를 직접 호출하지 않고 `/api/events`만 호출합니다
- API 도메인 장애/변경이 발생하면 `API_BASE_URL` 환경 변수만 업데이트 후 재배포하세요

## 개발자

by darlypapa
Contact: ppasha_nam@samsung.com
