const puppeteer = require('puppeteer');
const {run} = require('../res/sogive-make-donation.js');
const fs = require('fs');
const mkdirp = require('mkdirp');
const os = require('os');
const path = require('path');

const headless = false;
const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

test("Making a donation", async () => {
    const browser = await puppeteer.launch({headless});
    const page = await browser.newPage();
    await run(page);
    mkdirp.sync(DIR);
    fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
    //await browser.close();
}, 10000);
