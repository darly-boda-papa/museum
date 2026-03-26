from flask import Flask, request, Response
import requests

app = Flask(__name__)

@app.route('/')
def proxy():
    # Get the target URL from query parameters
    target_url = request.args.get('url')
    
    if not target_url:
        return "Error: No URL provided", 400
    
    try:
        # Forward the request to the target URL
        response = requests.get(target_url)
        
        # Create response with CORS headers
        resp = Response(response.content, status=response.status_code)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = '*'
        resp.headers['Content-Type'] = response.headers.get('Content-Type', 'text/xml')
        
        return resp
    except Exception as e:
        return f"Error: {str(e)}", 500

if __name__ == '__main__':
    print("CORS Proxy Server running on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000)