'use strict';

const JSDOMEnvironment = require('jest-environment-jsdom'); //require('jest-environment-jsdom');
const puppeteer = require('puppeteer');

class PuppeteerEnvironment extends JSDOMEnvironment {
  constructor(config) {
    super(config);
  }

  setup() {
    JSDOMEnvironment.prototype.setup().then(puppeteer.launch({ headless: false })).then(r => this.window.__BROWSER__ = r);
    // console.log("Called");
    // this.global.__BROWSER__ = await puppeteer.launch({headless: false});
  }

  teardown() {
    JSDOMEnvironment.prototype.teardown();
  }

  runScript(script) {
    return JSDOMEnvironment.prototype.runScript(script);
  }
}

module.exports = { PuppeteerEnvironment };
