const puppeteer = require('puppeteer');
const {login} = require('../test-base/res/UtilityFunctions');
const {username, password} = require('../test-base/credentials');
const Search = require('../sogive-scripts/sogive.org_search');
const Donation = require('../sogive-scripts/sogive.org_charity');

test('Logged-in charity donation', async () => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();
    await Search.goto(page);
    await login({page, username, password});  
    await Search.search({
        page, 
        search_term: 'oxfam'
    });
    await Search.gotoResult({
        page, 
        selectorOrInteger: 1
    });
    await Donation.donate({
        page, 
        Amount: {
            amount: 100
        }, 
        Details: {
            'name': 'Human Realman',
            'email': 'mark@winterwell.com',
            'address': '123 Clown Shoes Avenue',
            'postcode': 'CS20AD',
            'consent-checkbox': true,
            'anon-checkbox': true
        }
    });     
}, 15000);

test('Logged-out charity donation', async () => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();
    await Search.goto(page);
    await Search.search({
        page, 
        search_term: 'oxfam'
    });
    await Search.gotoResult({
        page, 
        selectorOrInteger: 1
    });
    await Donation.donate({page});     
}, 15000);
