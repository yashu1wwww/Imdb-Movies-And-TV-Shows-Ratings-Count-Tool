const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

// Serve static files if needed
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  const searchResult = req.query.result || '';
  const movieQuery = req.query.query || '';

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IMDB MOVIES & TV SHOWS RATINGS COUNT</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="icon" href="https://favicon-generator.org/favicon-generator/htdocs/favicons/2015-02-02/042180ff74ed65b9baae3da9a0c8f809.ico" type="image/x-icon">
      <style>
        html, body {
          overflow: hidden;
        }
        body {
          font-family: 'Arial', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-image: url('https://wallpaperaccess.com/full/1567770.gif');
          background-size: cover;
          background-position: center;
          color: white;
          flex-direction: column;
          text-align: center;
        }
        form {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: rgba(225, 168, 168, 0.16);
          padding: 83px;
          border-radius: 39px;
        }
        input[type="text"] {
          padding: 8px;
          margin-bottom: 27px;
          width: 317px;
          border: 1px solid #283147;
          border-radius: 18px;
          background-color: rgba(255, 255, 255, 0.8);
          color: #333;
        }
        button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <form action="/search" method="get" class="space-y-2">
        <div style="text-align: center;">
          <img src="https://e7.pngegg.com/pngimages/705/448/png-clipart-logo-imdb-film-logan-lerman-miscellaneous-celebrities-thumbnail.png" alt="IMDB Icon" style="height: 20px; width: 45px; display: inline-block;">
          <label for="query" class="text-lg font-bold" style="color: black; text-decoration: underline; font-size: 14px; display: inline-block; vertical-align: middle;">MOVIES &amp; TV SHOWS RATINGS COUNT</label>
          <br><br>
          <div style="text-align: center;">
            <label for="query" class="text-lg font-bold" style="color: #813333e0;">VISITORS COUNT</label>
            <br><br>
            <a href="https://www.hitwebcounter.com" target="_blank" style="display: inline-block;">
              <img src="https://hitwebcounter.com/counter/counter.php?page=13817460&amp;style=0006&amp;nbdigits=2&amp;type=page&amp;initCount=20" title="Counter Widget" alt="Visit counter For Websites" border="0">
            </a>
            <br>
            <div class="container" style="margin-top: 20px; text-align: center;">
              <button style="background-color: #00000000; padding: 10px 20px; margin-right: 1px;">
                <a href="https://yashwanthwebproject.netlify.app" style="color: black; text-decoration: none; font-size: 18px; font-weight: bold; display: block; background-color: inherit; border: 2px solid white; border-radius: 5px; padding: 5px;">
                  Web Development Projects
                </a>
              </button>
<p style="margin-top: 10px; font-size: 14px; color: black; font-weight: bold; text-align: center;">
  <span style="color: black;">Designed &amp; Developed By</span> 
  <a href="https://github.com/yashu1wwww" target="_blank" style="color: #007bff; text-decoration: none;">Yashwanth R</a>
</p>
            </div>
            <input type="text" id="query" name="query" value="${movieQuery}" placeholder="   Ex: RRR or RRR Telugu" class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-400 focus:ring-blue-400" onfocus="this.value = ''; document.getElementById('rating').innerHTML = '';">
            <br>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
              Search
            </button>
          </div>
        </div>
        <!-- Display IMDb Rating Inside the Form -->
        ${searchResult ? `
          <div id="rating" style="margin-top: 20px; padding: 10px; color: black; background-color: rgba(255, 255, 255, 0.7); border-radius: 10px;">
            <strong>Rating:</strong> ${searchResult}
          </div>
        ` : ''}
      </form>
    </body>
    </html>
  `);
});

app.get('/search', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.redirect('/');

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
  // Try first div (span.gsrt.KMdzJ)
  rating = await page.$eval('span.gsrt.KMdzJ', el => el.textContent.trim());
} catch {
  // If not found, try second div (span.yi40Hd.YrbPuc)
  try {
    rating = await page.$eval('span.yi40Hd.YrbPuc', el => el.textContent.trim());
  } catch {
    // If both are not found, set 'Rating not found'
    rating = 'Rating not found';
  }
}

console.log('Rating:', rating);

  await browser.close();

  // Redirect back to the home page with the search result
  res.redirect(`/?query=${encodeURIComponent(query)}&result=${encodeURIComponent(rating)}`);
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
