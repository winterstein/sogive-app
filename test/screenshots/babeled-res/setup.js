'use strict';

let setup = (() => {
  var _ref = _asyncToGenerator(function* () {
    const browser = yield puppeteer.launch({ headless: false });
    global.__BROWSER__ = browser;
  });

  return function setup() {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const chalk = require('chalk');
const puppeteer = require('puppeteer');

module.exports = setup;
