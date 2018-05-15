const chalk = require('chalk');
const puppeteer = require('puppeteer');
const fs = require('fs');
const mkdirp = require('mkdirp');
const os = require('os');
const path = require('path');

const headless = false;
const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

async function setup() {
  const browser = await puppeteer.launch({headless: false});
  mkdirp.sync(DIR);
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
}

module.exports = setup;
