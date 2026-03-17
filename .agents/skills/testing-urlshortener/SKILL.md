# Testing URL Shortener Microservice

## Local Setup

1. `npm install` in the repo root
2. `node index.js` to start the server (defaults to port 3000)
3. The app serves a form UI at `/` for manual POST testing
4. Restart the server between test runs to get a clean state (empty in-memory URL array)

## Key Endpoints

- `POST /api/shorturl` — accepts `url` in the request body (form-urlencoded). Returns `{"original_url": "...", "short_url": N}`
- `GET /api/shorturl/:short_url` — redirects (302) to the original URL if the ID exists, otherwise returns `{"error": "No short URL found for the given input"}`

## End-to-End Test Flow

1. **POST a valid URL** via the form at `/` or via curl:
   ```
   curl -X POST http://localhost:3000/api/shorturl -H "Content-Type: application/x-www-form-urlencoded" -d "url=https://www.freecodecamp.org"
   ```
   Expected: `{"original_url":"https://www.freecodecamp.org","short_url":1}`

2. **Test redirect** by visiting `http://localhost:3000/api/shorturl/1` in a browser or:
   ```
   curl -v http://localhost:3000/api/shorturl/1
   ```
   Expected: HTTP 302 with `Location: https://www.freecodecamp.org`

3. **Test invalid short URL** — visit `/api/shorturl/999` or `/api/shorturl/abc`
   Expected: `{"error":"No short URL found for the given input"}`

4. **Test invalid URL POST** — POST `url=ftp://invalid` or `url=notaurl`
   Expected: `{"error":"invalid url"}`

## Key Implementation Details

- The redirect route uses `parseInt(req.params.short_url, 10)` for safe type coercion from string URL params to numeric array index.
- A protocol verification check (`/^https?:\/\//i`) ensures the stored URL has `http://` or `https://` before calling `res.redirect()`. Without a protocol, Express treats the redirect target as a relative path, which causes the FCC redirect test to fail.
- The POST route validates URLs using `new URL()` which requires a protocol, so URLs should always be stored with one. The protocol check in the redirect route is a defensive safeguard.

## Known Issues / Tips

- The app uses **in-memory storage** (a plain array). Data is lost on every server restart. If deploying to Render's free tier, the instance may spin down after inactivity and lose all stored URLs. This can cause intermittent FCC test failures.
- If FCC redirect tests fail intermittently on Render, consider switching to MongoDB for persistent storage.
- The DNS lookup step (`dns.lookup`) may be slow or fail on some networks. If POST requests hang, this is likely the cause.
- No CI is configured on this repo — rely on local testing before pushing.
- The app uses Express's built-in `express.urlencoded()` and `express.json()` instead of the standalone `body-parser` package.

## Devin Secrets Needed

No secrets are required for local testing. For Render deployment, the user manages the Render dashboard directly.
