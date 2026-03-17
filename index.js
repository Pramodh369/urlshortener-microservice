require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory URL storage
const urlDatabase = [];

// POST /api/shorturl - create a short URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Validate URL format
  let urlObj;
  try {
    urlObj = new URL(originalUrl);
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }

  // Only allow http and https protocols
  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  // Verify the hostname with dns.lookup
  dns.lookup(urlObj.hostname, function(err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Check if URL already exists
    const existingIndex = urlDatabase.indexOf(originalUrl);
    if (existingIndex !== -1) {
      return res.json({ original_url: originalUrl, short_url: existingIndex + 1 });
    }

    // Store and return
    urlDatabase.push(originalUrl);
    const shortUrl = urlDatabase.length;
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// GET /api/shorturl/:short_url - redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);

  if (isNaN(shortUrl) || shortUrl < 1 || shortUrl > urlDatabase.length) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  const originalUrl = urlDatabase[shortUrl - 1];
  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
