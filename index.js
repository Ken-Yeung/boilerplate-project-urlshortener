require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const isValidHttpUrl = require('./utils/tools')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {

  res.json({ greeting: 'hello API' });
});

// Function
function convertShortUrl(req, res) {
  const _url = req.body.url
  const _invalid = {
    error: "invalid url"
  }

  // Check is there url or is valid
  if (!!!_url || !isValidHttpUrl(_url)) return res.send(_invalid)

  if (!!req.params.short_url) {
    // Inside /api/shorturl/:short_url
    res.redirect(_url)
  } else {
    // Inside /api/shorturl
    res.send({
      original_url: _url,
      short_url: 1
    })
  }
}

app.route("/api/shorturl").post(convertShortUrl)
app.route("/api/shorturl/:short_url").post(convertShortUrl)

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
