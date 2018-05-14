const puppeteer = require('puppeteer');
const {run} = require('../sogive-make-donation.js');

let browser;
let page;

async function init() {
	browser = await puppeteer.launch({headless: false});
    page = await browser.newPage();
    return page;
}

test("Making a donation", async () => {
    await init();
    await run(page);
    await browser.close();
}, 10000);
