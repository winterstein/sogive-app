const puppeteer = require('puppeteer');

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const loaded = page.waitForNavigation({waitUntil: 'networkidle0'});
  const mouse = page.mouse;
  const keyboard = page.keyboard;
  await page.setViewport({width: 1920,height: 1080});
  await page.goto('https://test.sogive.org');
  await loaded;
  await mouse.click(700,133);
  await loaded;
  await keyboard.type('malaria');
  await loaded;
  await mouse.click(1424,130);
  await loaded;
  await timeout(3000)
  await mouse.click(530,460);
  await timeout(2000)
  await page.screenshot({path: 'test/click-through/' + new Date().toISOString() + '.png'});
  await browser.close();
})();
