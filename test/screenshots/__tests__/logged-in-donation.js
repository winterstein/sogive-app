const puppeteer = require('puppeteer');
const {run} = require('../sogive-make-donation');
const {login} = require('../res/UtilityFunctions');
const {username, password} = require('../credentials');
const Search = require('../sogive-scripts/sogive.org_search');
const Donation = require('../sogive-scripts/sogive.org_charity');

const firstTestName = "Log in";  
test(firstTestName, async () => {
    window.__TESTNAME__ = firstTestName;
    const browser = window.__BROWSER__;
    const page = await browser.newPage();
    await Search.goto(page);
    await login({page, username, password});
    await Search.goto(page);    
    await Search.search({
        page, 
        search_term: 'oxfam'
    });
    await Search.gotoResult({
        page, 
        selectorOrInteger: 1
    });
    await page.waitFor(3000);//Possible to eliminate this? Issue is with image loading in late
    await Donation.donate({
        page, 
        amount: 100, 
        details: {
            'name': 'Human Realman',
            'email': 'mark@winterwell.com',
            'address': '123 Clown Shoes Avenue',
            'postcode': 'CS20AD',
            'charityConsent': true,
            'anon': true
        }
    });   
    await Donation.testSubmit({page});   
}, 15000);
