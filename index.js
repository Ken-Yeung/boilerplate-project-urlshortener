require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const isValidHttpUrl = require('./utils/tools')
const { JsonDB, Config } = require('node-json-db');

const db = new JsonDB(new Config("myDataBase", true, false, '/'));
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
async function convertShortUrl(req, res) {
  const dataPath = "/shorturl"
  const _url = req.body.url
  const _invalid = {
    error: "invalid url"
  }

  // if (req.method == "GET") {
  //   console.log("method:", req.method);
  //   console.log("host:", req.hostname);
  //   console.log("path:", req.path);
  //   console.log("req.params.short_url:", req.params.short_url);
  // }

  // Check is there url or is valid
  if ((!!!_url || !isValidHttpUrl(_url)) && !!!req.params.short_url) return res.send(_invalid)

  if (!!req.params.short_url) {
    // Inside /api/shorturl/:short_url
    // Find by short_url
    // If None response _invalid
    try {
      const currentDb = await db.getData(dataPath)
      const result = currentDb.find((_) => _.short_url == req.params.short_url)
      if (!!result) return res.redirect(result.original_url)
      return res.send(_invalid)
    } catch {
      return res.send(_invalid)
    }
  } else {
    // Inside /api/shorturl
    // Get and check db
    // Save if can't find one
    var resp = {
      original_url: _url,
      short_url: 1
    }

    try {
      // Find One
      const currentDb = await db.getData(dataPath)
      const findOne = currentDb.find((_) => _.original_url === _url)

      if (!!findOne) {
        resp = findOne
      } else {
        // update short url id
        resp.short_url = currentDb.length + 1
        await db.push(dataPath, [
          ...currentDb,
          resp
        ])
      }
    } catch {
      // Push One
      await db.push(dataPath, [
        resp
      ])
    }

    return res.send(resp)
  }
}

app.route("/api/shorturl").post(convertShortUrl)
app.route("/api/shorturl/:short_url").get(convertShortUrl)

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
