'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const JSDOMEnvironment = require('jest-environment-jsdom'); //require('jest-environment-jsdom');
const puppeteer = require('puppeteer');

class PuppeteerEnvironment extends JSDOMEnvironment {
  constructor(config) {
    super(config);
  }

  setup() {
    var _this = this;

    return _asyncToGenerator(function* () {
      yield JSDOMEnvironment.prototype.setup();
      _this.window.__BROWSER__ = yield puppeteer.launch({ headless: false });
      // console.log("Called");
      // this.global.__BROWSER__ = await puppeteer.launch({headless: false});
    })();
  }

  teardown() {
    return _asyncToGenerator(function* () {
      yield JSDOMEnvironment.prototype.teardown();
    })();
  }

  runScript(script) {
    return JSDOMEnvironment.prototype.runScript(script);
  }
}

exports.default = PuppeteerEnvironment;
