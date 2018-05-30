const puppeteer = require('puppeteer');
const {login} = require('../test-base/res/UtilityFunctions');
const {username, password} = require('../../../logins/sogive-app/puppeteer.credentials');
const Fundraiser = require('../sogive-scripts/fundraiser');


test('Logged-out fundraiser donation', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    await Fundraiser.goto({page, fundId: 'mark.Piz7VKuA.541930'});
    await Fundraiser.donate({page, Message: {message:''}, Payment: {tip: 3.50, "include-tip-checkbox": false}});
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

//Want to create an additional test that checks to see if the donation total has been correctly incremented
//Could do this either by scraping from page, or reading directly from JSON. Will be testing two seperate things:
//perfectly possible for the total displayed to be screwey while the JSON data is perfectly fine.
