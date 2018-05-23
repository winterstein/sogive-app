const puppeteer = require('puppeteer');
const {login} = require('../test-base/res/UtilityFunctions');
const {username, password} = require('../test-base/credentials');
const Fundraiser = require('../sogive-scripts/fundraiser');


test('Fundraiser donation (logged out)', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    await Fundraiser.goto({page, fundId: 'mark.Piz7VKuA.541930'});
    await page.waitFor(3000);
    await Fundraiser.donate({page});
    //await page.click(`#fundraiser > div > div:nth-child(2) > div:nth-child(1) > a`);
    // await Fundraiser.gotoResult({page, selectorOrInteger: 1});
}
, 60000);
