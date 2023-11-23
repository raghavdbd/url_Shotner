


const express = require('express');
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());

const urlDatabase = {};

app.post('/api/shorten', (req, res) => {
  const { url, customAlias } = req.body;

  if (customAlias) {
    if (urlDatabase[customAlias]) {
      return res.status(400).json({ error: 'Custom alias already exists' });
    }

    urlDatabase[customAlias] = {
      url,
      createdAt: Date.now(),
      expiresIn: 2 * 60 * 60 * 1000, // Expiration time in milliseconds (2 hours)
    };

    return res.json({ originalUrl: url, shortenedUrl: customAlias });
  }

  const shortId = nanoid(6);
  urlDatabase[shortId] = {
    url,
    createdAt: Date.now(),
    expiresIn: 2 * 60 * 60 * 1000, // Expiration time in milliseconds (2 hours)
  };

  const shortenedUrl = `http://localhost:3000/${shortId}`;
  res.json({ originalUrl: url, shortenedUrl });
});

app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const urlData = urlDatabase[shortId];

  if (urlData && Date.now() - urlData.createdAt < urlData.expiresIn) {
    res.redirect(urlData.url);
  } else {
    delete urlDatabase[shortId]; // Remove expired URL from database
    res.status(404).send('URL not found or expired');
  }
});

const PORT = process.env.PORT || 7980;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(express.static('public'));

