const puppeteer = require('puppeteer');
const {run} = require('../res/sogive-make-donation.js');

let browser;
let page;

async function init() {
	browser = await puppeteer.launch({headless: true});
    page = await browser.newPage();
}

test("Making a donation", async () => {
    await init();
    await run(page);
    await browser.close();
}, 10000);
