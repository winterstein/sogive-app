const JSDOMEnvironment = require('jest-environment-jsdom');//require('jest-environment-jsdom');
const puppeteer = require('puppeteer');

class PuppeteerEnvironment extends JSDOMEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await JSDOMEnvironment.prototype.setup();
    this.window.__BROWSER__ = await puppeteer.launch({headless: false});
    // console.log("Called");
    // this.global.__BROWSER__ = await puppeteer.launch({headless: false});
  }

  async teardown() {   
    await JSDOMEnvironment.prototype.teardown();
  }

  runScript(script) {
    return JSDOMEnvironment.prototype.runScript(script);
  }
}

export default PuppeteerEnvironment;
