const puppeteer = require('puppeteer');
const {login} = require('../test-base/res/UtilityFunctions');
const {username, password} = require('../test-base/credentials');
const Fundraiser = require('../sogive-scripts/fundraiser');


test('Logged-out fundraiser donation', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    await Fundraiser.goto({page, fundId: 'mark.Piz7VKuA.541930'});
    await Fundraiser.donate({page, Message: {message:''}});
}
, 30000);

test('Logged-in fundraiser donation', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    await Fundraiser.goto({page, fundId: 'mark.Piz7VKuA.541930'});
    await login({page, username, password});    
    await Fundraiser.donate({page, Message: {message:''}});
}
, 30000);
