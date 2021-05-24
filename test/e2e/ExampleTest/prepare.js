const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Sets puppeteer up and launch.
 *
 * @param {*} option
 * @returns { captureDir, browser, page }
 */
async function prepare({ newCapture, headless, basicAuth }) {
  const captureDir = path.resolve(
    __dirname,
    '..',
    newCapture ? 'newcapture' : 'capture'
  );
  fs.mkdirSync(captureDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    ignoreHTTPSErrors: true,
    args: ['--start-maximized', '--lang=en-US'],
  });

  const page = await browser.newPage();

  if (basicAuth) {
    const [username, password] = process.argv
      .slice(2)
      .filter((opt) => /^--basicAuth/.test(opt))
      .map((v) => {
        const [, authInfo] = v.split('=');
        return authInfo.split(':');
      })
      .flat();
    await page.authenticate({ username, password });
  }

  await abortPollingConections(page);

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'language', {
      get: () => 'en-US',
    });
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
  });
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US',
  });

  return { captureDir, browser, page };
}

/**
 * Adds an event listener to terminate pollig connections.
 *
 * @param {*} page
 * @see https://github.com/puppeteer/puppeteer/issues/3471
 */
async function abortPollingConections(page) {
  await page.setRequestInterception(true);

  const blockedResources = [
    'quantserve',
    'adzerk',
    'doubleclick',
    'adition',
    'exelator',
    'sharethrough',
    'twitter',
    'google-analytics',
    'fontawesome',
    'facebook',
    'analytics',
    'optimizely',
    'clicktale',
    'mixpanel',
    'zedo',
    'clicksor',
    'tiqcdn',
    'googlesyndication',
    '__webpack_hmr',
    '_loading/sse',
  ];

  page.on('request', (req) =>
    blockedResources.some((b) => req.url().includes(b))
      ? req.abort()
      : req.continue()
  );
}

module.exports = prepare;
