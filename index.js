require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// File-based URL storage for persistence across restarts
const DATA_FILE = path.join(__dirname, 'public', 'data.json');

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const file = fs.readFileSync(DATA_FILE, 'utf8');
    if (!file || file.length === 0) {
      return [];
    }
    return JSON.parse(file);
  } catch (e) {
    return [];
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

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

    var data = loadData();

    // Check if URL already exists
    var existing = data.find(function(item) {
      return item.original_url === originalUrl;
    });
    if (existing) {
      return res.json({ original_url: existing.original_url, short_url: existing.short_url });
    }

    // Create new entry
    var shortUrl = data.length + 1;
    var entry = { original_url: originalUrl, short_url: shortUrl };
    data.push(entry);
    saveData(data);

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// GET /api/shorturl/:short_url - redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  var shortUrl = parseInt(req.params.short_url, 10);

  if (isNaN(shortUrl) || shortUrl < 1) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  var data = loadData();
  var entry = data.find(function(item) {
    return item.short_url === shortUrl;
  });

  if (!entry) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  var originalUrl = entry.original_url;

  // Ensure the URL includes a protocol for proper redirect
  if (!/^https?:\/\//i.test(originalUrl)) {
    originalUrl = 'http://' + originalUrl;
  }

  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
