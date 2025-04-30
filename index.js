const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname)); // To serve static files

app.get('/', (req, res) => {
  res.send(`
    <form action="/search" method="get">
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
      '--disable-blink-features=AutomationControlled', // Mimic real browser
      '--disable-dev-shm-usage', // Further optimization for resource usage
    ],
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();

  // Disable unnecessary resource loading to speed up the process
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
      request.abort(); // Skip loading images, styles, and fonts
    } else {
      request.continue();
    }
  });

  // Spoof user-agent and navigator.webdriver
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36');
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  // Perform the search
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
    waitUntil: 'domcontentloaded', // Faster than 'networkidle2'
    timeout: 10000 // Timeout after 10 seconds if page is not loaded
  });

  // Scrape the movie rating
  let rating;
  try {
    rating = await page.$eval('span.gsrt.KMdzJ', element => element ? element.textContent : 'Rating not found');
  } catch (error) {
    rating = 'Rating not found'; // Handle case where element is missing
  }

  await browser.close();

  res.send(`
    <h2>Search result for: ${query}</h2>
    <p>Rating: ${rating}</p>
    <br><br><a href="/">🔍 Search again</a>
  `);
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
