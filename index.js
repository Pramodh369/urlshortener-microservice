require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// In-memory URL storage
var urlDatabase = [];
var urlCounter = 0;

// POST /api/shorturl - create a short URL
app.post('/api/shorturl', function(req, res) {
  var originalUrl = req.body.url;

  // Validate URL using the URL constructor
  var urlObj;
  try {
    urlObj = new URL(originalUrl);
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }

  // Only allow http and https protocols
  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  // Check if URL already exists
  var existing = urlDatabase.find(function(item) {
    return item.original_url === originalUrl;
  });
  if (existing) {
    return res.json({ original_url: existing.original_url, short_url: existing.short_url });
  }

  // Create new entry with short_url as a Number
  urlCounter++;
  var entry = { original_url: originalUrl, short_url: urlCounter };
  urlDatabase.push(entry);

  res.json({ original_url: originalUrl, short_url: urlCounter });
});

// GET /api/shorturl/:short_url - redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  var shortUrl = +req.params.short_url;

  if (isNaN(shortUrl) || shortUrl <= 0) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  var entry = urlDatabase.find(function(item) {
    return item.short_url === shortUrl;
  });

  if (!entry) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  res.redirect(entry.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
