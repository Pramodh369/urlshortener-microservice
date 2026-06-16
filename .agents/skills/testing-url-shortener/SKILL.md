# URL Shortener Microservice - Testing Guide

## Project Overview
Express.js URL shortener microservice for freeCodeCamp backend certification. Stores shortened URLs and redirects visitors.

## Local Setup
```bash
npm install
node index.js
# Server runs on http://localhost:3000
```

No lint or typecheck commands are configured in this project.

## Key Endpoints
- `GET /` - Serves the HTML form
- `POST /api/shorturl` - Creates a short URL (body: `url=<url>`)
- `GET /api/shorturl/:short_url` - Redirects to the original URL

## Testing Flows

### 1. POST a URL
```bash
curl -X POST http://localhost:3000/api/shorturl \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "url=https://www.freecodecamp.org"
```
Expected: `{"original_url":"https://www.freecodecamp.org","short_url":1}`

### 2. Redirect
```bash
curl -v http://localhost:3000/api/shorturl/1
```
Expected: `HTTP/1.1 302 Found` with `Location: https://www.freecodecamp.org`

### 3. Persistence (CRITICAL for FCC test #3)
The FCC test POSTs a URL and then immediately GETs the redirect. On Render free tier, the app may restart between these requests, wiping in-memory data.

**To test persistence:**
1. POST a URL
2. Kill and restart the server
3. GET the short URL — it should still redirect

If using file-based storage (`public/data.json`), verify the file exists after POST and contains the entry.

### 4. Invalid URL
```bash
curl -X POST http://localhost:3000/api/shorturl \
  -d "url=ftp://invalid"
```
Expected: `{"error":"invalid url"}`

### 5. Invalid short_url
```bash
curl http://localhost:3000/api/shorturl/999
```
Expected: `{"error":"No short URL found for the given input"}`

## Common Issues

### FCC Test #3 Failing
- **Root cause:** In-memory storage gets wiped on Render cold starts
- **Fix:** Use persistent storage (file-based JSON or MongoDB)
- **Note:** Render's free tier has an ephemeral filesystem — files persist across process restarts within the same instance but may be wiped on full instance recycling or new deploys. For guaranteed persistence, MongoDB Atlas (free tier) is more reliable.

### Redirect Not Working
- Ensure `original_url` includes protocol (`http://` or `https://`)
- `res.redirect()` without a protocol treats the URL as a relative path

### parseInt for short_url
- URL params come as strings; use `parseInt(req.params.short_url, 10)` when comparing against numeric stored IDs

## Deployment
- Hosted on Render (free tier)
- Auto-deploys from GitHub main branch
- Live URL: https://urlshortener-microservice-e9xh.onrender.com/
- After merging PRs, Render redeploys automatically

## Devin Secrets Needed
No secrets are required for local testing. GitHub access is needed for pushing code.
