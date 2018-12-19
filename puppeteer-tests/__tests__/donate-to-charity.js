const puppeteer = require('puppeteer');
const {APIBASE, login, soGiveFailIfPointingAtProduction} = require('../test-base/res/UtilityFunctions');
const {username, password} = require('../../../logins/sogive-app/puppeteer.credentials');
const {donate} = require('../sogive-scripts/donation-form');
const {CommonSelectors, SoGiveSelectors: {Search}} = require('../test-base/utils/SelectorsMaster');

const Details = {
    'name': 'Human Realman',
    'email': 'mark@winterwell.com',
    'address': '123 Clown Shoes Avenue',
    'postcode': 'CS20AD',
    'consent-checkbox': true,
};

test('Logged-in charity donation', async () => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    await page.goto(APIBASE + '/#search?q=');
    await soGiveFailIfPointingAtProduction({page});
    await login({page, username, password});  

    // Search for charity
    await page.click(Search.Main.SearchField);
    await page.keyboard.type('oxfam');
    await page.click(Search.Main.SearchButton);

    // Click on first link in search results
    await page.waitForSelector(Search.Main.FirstResult);
    await page.click(Search.Main.FirstResult);

    await donate({
        page, 
        Amount: {
            amount: 1
        }, 
        GiftAid: {},
        Details
    });     
}, 20000);

test('Logged-out charity donation', async () => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    await page.goto(APIBASE + '/#search?q=');
    await soGiveFailIfPointingAtProduction({page});
    
    // Search for charity
    await page.click(Search.Main.SearchField);
    await page.keyboard.type('oxfam');
    await page.click(Search.Main.SearchButton);

    // Click on first link in search results
    await page.waitForSelector(Search.Main.FirstResult);
    await page.click(Search.Main.FirstResult);

    await donate({
        page, 
        Amount: {
            amount: 1
        }, 
        GiftAid: {},
        Details
    });       
}, 20000);
