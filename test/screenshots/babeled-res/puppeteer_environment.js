'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const chalk = require('chalk');
const NodeEnvironment = require('jest-environment-node');
const puppeteer = require('puppeteer');
const fs = require('fs');
const os = require('os');
const path = require('path');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

class PuppeteerEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  setup() {
    var _this = this;

    return _asyncToGenerator(function* () {
      console.warn("Environment check!!!!!!!!!!");
      yield NodeEnvironment.prototype.setup();
      const wsEndpoint = fs.readFileSync(path.join(DIR, 'wsEndpoint'), 'utf8');
      if (!wsEndpoint) {
        throw new Error('wsEndpoint not found');
      }
      _this.global.__BROWSER__ = yield puppeteer.connect({
        browserWSEndpoint: wsEndpoint
      });
    })();
  }

  teardown() {
    return _asyncToGenerator(function* () {
      yield NodeEnvironment.prototype.teardown();
    })();
  }

  runScript(script) {
    return NodeEnvironment.prototype.runScript(script);
  }
}

module.exports = PuppeteerEnvironment;
