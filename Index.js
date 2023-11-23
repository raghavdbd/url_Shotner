//initializing the Express// 
const express = require('express');
//  nanoid is use to generate small compact id
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());

// this is used to url as key and shorter url as value
const urlDatabase = {};

app.post('/api/shorten', (req, res) => {
    //  we get input from user
  const { url, customAlias } = req.body;
//  if url is already present in databse we can just return the error message that alias exist
  if (customAlias && urlDatabase[customAlias]) {
    return res.status(400).json({ error: 'Custom alias already exists' });
  }
//  it will check if custom alias is provided or not otherwise we can use unique id generate by nanoid
  const shortId = customAlias || nanoid(6);
  urlDatabase[shortId] = {
    url,
    createdAt: Date.now(), // Store creation time
    expiresIn: 2 * 60 * 60 * 1000, // Expiration time in milliseconds (2 hours)
  };

  const shortenedUrl = `http://localhost:3000/${shortId}`;
  res.json({ originalUrl: url, shortenedUrl });
});

app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  const urlData = urlDatabase[shortId];
//  it will url is still valid 
  if (urlData && Date.now() - urlData.createdAt < urlData.expiresIn) {
    res.redirect(urlData.url);
  } else {
    delete urlDatabase[shortId]; // Remove expired URL from database
    res.status(404).send('URL not found or expired');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(express.static('public'));
