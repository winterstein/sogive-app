function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const puppeteer = require('puppeteer');

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

_asyncToGenerator(function* () {
  const browser = yield puppeteer.launch();
  const page = yield browser.newPage();
  const loaded = page.waitForNavigation({ waitUntil: 'networkidle0' });
  const mouse = page.mouse;
  const keyboard = page.keyboard;
  yield page.setViewport({ width: 1920, height: 1080 });
  yield page.goto('https://test.sogive.org');
  yield loaded;
  yield mouse.click(700, 133);
  yield loaded;
  yield keyboard.type('malaria');
  yield loaded;
  yield mouse.click(1424, 130);
  yield loaded;
  yield timeout(3000);
  yield mouse.click(530, 460);
  yield timeout(2000);
  yield page.screenshot({ path: 'production/click-through/' + new Date().toISOString() + '.png' });
  yield browser.close();
})();
