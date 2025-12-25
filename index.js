const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;


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
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <link rel="icon" href="https://e7.pngegg.com/pngimages/705/448/png-clipart-logo-imdb-film-logan-lerman-miscellaneous-celebrities-thumbnail.png" type="image/x-icon">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          overflow-x: hidden;
          min-height: 100vh;
        }
        
        body {
          font-family: 'Poppins', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          color: white;
          flex-direction: column;
          text-align: center;
          padding: 20px;
          position: relative;
        }
        
        body::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          pointer-events: none;
        }
        
        .main-container {
          position: relative;
          z-index: 1;
          animation: fadeInUp 1s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .header-section {
          margin-bottom: 30px;
        }
        
        .imdb-logo {
          height: 40px;
          width: 80px;
          margin-bottom: 15px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
          transition: transform 0.3s ease;
        }
        
        .imdb-logo:hover {
          transform: scale(1.1);
        }
        
        .main-title {
          background: linear-gradient(45deg, #fffeff, #ffd891, #ffc1b5a8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.5rem;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          margin-bottom: 20px;
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        }
        form {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 40px;
          border-radius: 25px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          max-width: 500px;
          width: 100%;
        }
        
        form:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }
        
        .visitors-section {
          margin: 20px 0;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .visitors-title {
          color: #FFD700;
          font-weight: 600;
          margin-bottom: 15px;
          font-size: 1.1rem;
        }
        
        .counter-widget {
          transition: transform 0.3s ease;
        }
        
        .counter-widget:hover {
          transform: scale(1.05);
        }
        
        .web-projects-btn {
          background: linear-gradient(45deg, #667eea, #764ba2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 12px 24px;
          margin: 15px 0;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .web-projects-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .web-projects-btn:hover::before {
          left: 100%;
        }
        
        .web-projects-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .web-projects-btn a {
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          position: relative;
          z-index: 1;
        }
        
        .developer-credit {
          margin-top: 15px;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .developer-credit a {
          color: #FFD700;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }
        
        .developer-credit a:hover {
          color: #FFA500;
        }
        
        .search-section {
          margin-top: 20px;
        }
        
        .input-group {
          position: relative;
          margin-bottom: 25px;
        }
        
        input[type="text"] {
          width: 100%;
          padding: 15px 20px 15px 50px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: white;
          font-size: 1rem;
          font-weight: 400;
          transition: all 0.3s ease;
          outline: none;
        }
        
        input[type="text"]::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        
        input[type="text"]:focus {
          border-color: #FFD700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
          transform: translateY(-2px);
        }
        
        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
        }
        
        button {
          background: linear-gradient(45deg, #FFD700, #FFA500);
          color: white;
          border: none;
          border-radius: 25px;
          padding: 15px 30px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          min-width: 150px;
        }
        
        button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        
        button:hover::before {
          left: 100%;
        }
        
        button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(255, 165, 0, 0.4);
        }
        
        button:active {
          transform: translateY(-1px);
        }
        
        .rating-result {
          margin-top: 25px;
          padding: 20px;
          background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
          border: 2px solid rgba(255, 215, 0, 0.3);
          border-radius: 15px;
          backdrop-filter: blur(10px);
          animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .rating-result strong {
          color: #FFD700;
          font-size: 1.1rem;
        }
        
        .rating-value {
          color: #FFA500;
          font-weight: 700;
          font-size: 1.2rem;
        }
        
        @media (max-width: 768px) {
          body {
            padding: 10px;
          }
          
          form {
            padding: 30px 20px;
          }
          
          .main-title {
            font-size: 1.2rem;
          }
          
          input[type="text"] {
            padding: 12px 15px 12px 45px;
          }
          
          button {
            padding: 12px 25px;
          }
        }
      </style>
    </head>
    <body>
      <div class="main-container">
        <form action="/search" method="get">
          <div class="header-section">
            <img src="https://e7.pngegg.com/pngimages/705/448/png-clipart-logo-imdb-film-logan-lerman-miscellaneous-celebrities-thumbnail.png" alt="IMDB Icon" class="imdb-logo">
            <div class="main-title">
              <i class="fas fa-star"></i> MOVIES & TV SHOWS RATINGS COUNT <i class="fas fa-star"></i>
            </div>
          </div>
          
          <div class="visitors-section">
            <div class="visitors-title">
              <i class="fas fa-users"></i> VISITORS COUNT
            </div>
            <a href="https://www.hitwebcounter.com" target="_blank" class="counter-widget" style="display: inline-block;">
              <img src="https://hitwebcounter.com/counter/counter.php?page=13817460&style=0006&nbdigits=2&type=page&initCount=20" title="Counter Widget" alt="Visit counter For Websites" border="0" style="border-radius: 8px;">
            </a>
            
            <div class="web-projects-btn">
              <a href="https://yashwanthwebproject.netlify.app" target="_blank">
                <i class="fas fa-code"></i>
                  Web Development Projects
              </a>
            </div>
            
            <div class="developer-credit">
              <span>Designed & Developed By</span> 
              <a href="https://github.com/yashu1wwww" target="_blank">Yashwanth R</a>
            </div>
          </div>
          
          <div class="search-section">
            <div class="input-group">
              <i class="fas fa-search search-icon"></i>
              <input type="text" id="query" name="query" value="${movieQuery}" placeholder="Ex: RRR or RRR Telugu" onfocus="this.value = ''; const ratingEl = document.getElementById('rating'); if(ratingEl) ratingEl.innerHTML = '';">
            </div>
            
            <button type="submit">
              <i class="fas fa-film"></i>
              Search
            </button>
          </div>
          
          <!-- Display IMDb Rating Inside the Form -->
          ${searchResult ? `
            <div id="rating" class="rating-result">
              <i class="fas fa-star" style="color: #FFD700; margin-right: 8px;"></i>
              <strong>Rating:</strong> <span class="rating-value">${searchResult}</span>
            </div>
          ` : ''}
        </form>
      </div>
    </body>
    </html>
  `);
});

app.get('/search', async (req, res) => {
  const query = (req.query.query || '').trim();
  if (!query) return res.redirect('/');

const browser = await puppeteer.launch({
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu"
  ]
});


  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  // ✅ FIXED: No extra spaces
const searchUrl = `https://www.google.com/search?q=movie+rating+${encodeURIComponent(query)}`;
  await page.goto(searchUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 10000
  });

  // ✅ Handle Google cookie consent (2025+)
  try {
    await page.waitForSelector('#L2AGLb, button[aria-label="Accept all"]', { timeout: 3000 });
    await page.click('#L2AGLb, button[aria-label="Accept all"]');
    await page.waitForTimeout(1000);
  } catch (e) {
    // Ignore
  }

  let rating = 'Rating not found';
  try {
    const texts = await page.evaluate(() =>
      Array.from(document.querySelectorAll('span, div, a'))
        .map(el => el.textContent.trim())
        .filter(txt => txt.length > 0)
    );

    const plainRating = texts.find(txt => {
      const n = parseFloat(txt);
      return !isNaN(n) && n >= 1.0 && n <= 10.0 && txt.includes('.');
    });

    const slashRating = texts.find(txt => /^\d+\.\d+\/10$/.test(txt));

    rating = plainRating || (slashRating ? slashRating.split('/')[0] : 'Rating not found');
  } catch (e) {
    rating = 'Rating not found';
  }

  console.log('IMDb Rating for "%s": %s', query, rating);
  await browser.close();
  res.redirect(`/?query=${encodeURIComponent(query)}&result=${encodeURIComponent(rating)}`);
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

