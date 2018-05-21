const puppeteer = require('puppeteer');
const UtilityFunctions = require('../res/UtilityFunctions');

//Quick scraping experiment
//Want to know how strict DOM selectors need to be to find correct element
//Feel that this would be more robust than clicking on predetermined part of screen, 
//but it could end up being fairly fragile.

async function run() {
    //Want to be able to override these with console args later
    const args = {
        headless: true,
        APIBASE: 'http://local.sogive.org'
    };
    
    const CREATE_BUTTON = '#editEvent > div > button'; 
    let page;
    let browser;

    try {
        browser = await puppeteer.launch(args);
        page = await browser.newPage();

        await page.goto(`${args.APIBASE}/#editEvent/`);
        await page.click(CREATE_BUTTON);
    }
    catch(error) {
        await UtilityFunctions.onFail({page, error});
        browser.close();
    }
}

run();
