const puppeteer = require('puppeteer');
const {takeScreenshot} = require('./UtilityFunctions');

const headless = false;

beforeAll(async () => {
    //Can't access global from tests
    window.__BROWSER__ = await puppeteer.launch({headless});
});

afterAll(async () => {
    const browser = window.__BROWSER__;
    const pages = await browser.pages();

    //Start at 1 to skip over chrome home page
    for(let i=1; i<pages.length; i++) {
        await takeScreenshot(pages[i]);
    }

    await window.__BROWSER__.close();
});
