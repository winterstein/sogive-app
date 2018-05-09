const puppeteer = require('puppeteer');
const UtilityFunctions = require('./UtilityFunctions');

const headless = false;

//Quick scraping experiment
//Want to know how strict DOM selectors need to be to find correct element
//Feel that this would be more robust than clicking on predetermined part of screen, 
//but it could end up being fairly fragile.

async function run() {
    const SEARCH_FIELD = `#formq`;
    const SEARCH_BUTTON = `span.sogive-search-box.input-group-addon`;

    const browser = await puppeteer.launch({headless});
    const page = await browser.newPage();

    await page.goto('http://local.sogive.org/#search?q=');

    await page.click(SEARCH_FIELD);
    await page.keyboard.type('oxfam');
    await page.click(SEARCH_BUTTON);

}

run();
