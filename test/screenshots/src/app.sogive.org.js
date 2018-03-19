const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const loaded = page.waitForNavigation({waitUntil: 'networkidle0'});
  const mouse = page.mouse;
  await page.setViewport({width: 1920,height: 1080});
  await page.goto('https://app.sogive.org');
  await loaded;
  await page.screenshot({path: 'test.sogive.org.png'});

  await browser.close();
})();
