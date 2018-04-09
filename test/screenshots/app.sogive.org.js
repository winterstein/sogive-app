function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const puppeteer = require('puppeteer');

_asyncToGenerator(function* () {
  const browser = yield puppeteer.launch();
  const page = yield browser.newPage();
  const loaded = page.waitForNavigation({ waitUntil: 'networkidle0' });
  const mouse = page.mouse;
  yield page.setViewport({ width: 1920, height: 1080 });
  yield page.goto('https://app.sogive.org');
  yield loaded;
  yield page.screenshot({ path: 'test.sogive.org.png' });

  yield browser.close();
})();
