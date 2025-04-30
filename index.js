const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

// Serve static files if needed
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.send(`
    <form action="/search" method="get" style="margin-top:50px; text-align:center;">
      <input name="q" placeholder="Enter movie or topic" required style="padding:8px;width:250px;">
      <button type="submit" style="padding:8px;">Search</button>
    </form>
  `);
});

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.send("Query missing");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
    ],
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const blockTypes = ['image', 'stylesheet', 'font', 'media'];
    if (blockTypes.includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36');
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  // Use Google to search with "movie rating" prepended
  const searchUrl = `https://www.google.com/search?q=movie+rating+${encodeURIComponent(query)}`;
  await page.goto(searchUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 10000
  });

  let rating;
  try {
    rating = await page.$eval('span.gsrt.KMdzJ', el => el.textContent.trim());
  } catch {
    rating = 'Rating not found';
  }

  await browser.close();

  res.send(`
    <div style="text-align:center;margin-top:50px;">
      <h2>Search result for: <em>${query}</em></h2>
      <p><strong>IMDb Rating:</strong> ${rating}</p>
      <br><a href="/">🔍 Search again</a>
    </div>
  `);
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
