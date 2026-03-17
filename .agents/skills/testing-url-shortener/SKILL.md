# Testing URL Shortener Microservice

## Setup
1. Run `npm install` in the repo root
2. Start the server: `npm start` (runs on port 3000 by default)
3. The server uses in-memory storage, so data resets on restart

## Key Endpoints
- `GET /` - Serves the HTML form UI
- `POST /api/shorturl` - Create a short URL. Body: `url=<full_url>` (form-urlencoded)
- `GET /api/shorturl/:id` - Redirects to the original URL (302)

## Test Scenarios

### Valid URL acceptance
```bash
curl -X POST http://localhost:3000/api/shorturl -d "url=https://www.google.com"
```
Expected: `{"original_url":"https://www.google.com","short_url":1}`

### Redirect
```bash
curl -I http://localhost:3000/api/shorturl/1
```
Expected: HTTP 302 with `Location: https://www.google.com`

### Invalid URL rejection (non-http protocol)
```bash
curl -X POST http://localhost:3000/api/shorturl -d "url=ftp://example.com"
```
Expected: `{"error":"invalid url"}`

### Invalid URL rejection (random string)
```bash
curl -X POST http://localhost:3000/api/shorturl -d "url=not_a_url"
```
Expected: `{"error":"invalid url"}`

### Duplicate URL deduplication
POSTing the same URL twice should return the same `short_url` number.

## Common Issues
- **dns.lookup errors rejecting valid URLs**: The `dns.lookup()` callback may return errors for valid URLs in certain environments (e.g., freeCodeCamp test runner, restricted DNS environments). URL format validation should be handled by the regex and `new URL()` constructor, not by DNS errors. See [freeCodeCamp#65378](https://github.com/freeCodeCamp/freeCodeCamp/issues/65378).
- **freeCodeCamp test 3 failing**: This is typically caused by the dns.lookup error check. The fix is to remove the `err` parameter check in the dns.lookup callback.

## Browser Testing
The app serves an HTML form at `http://localhost:3000` where you can submit URLs via the UI and see the JSON response.

## No CI / No Lint
This repo has no CI pipeline, no linter config, and no automated tests. Validation is done manually or through the freeCodeCamp test runner.

## Devin Secrets Needed
None - this project requires no authentication or API keys.
