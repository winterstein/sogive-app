const puppeteer = require('puppeteer');
const {run} = require('../sogive-scripts/sogive-make-donation');
const Search = require('../sogive-scripts/sogive.org_search');
const Donation = require('../sogive-scripts/sogive.org_charity');

//Only Jest-specific actions you need to take here are
//to wrap your test in a test() function and
//grab the browser instance from window.
//test("Title", async () => {}, timeout_in_ms)
test("Example stub", async () => {
    //Browser is set up in setup_script.js
    const browser = await window.__BROWSER__;
    window.__TESTNAME__ = "Example stub";
    //Do the test
    const page = await browser.newPage();
    await run(page);
}, 10000);

const firstTestName = "Make a donation";  
test(firstTestName, async () => {
    /**Passing test name to window not strictly necessary.
     * Variable used to name screenshot repositry in setup_script.
     * Might need to be careful about setting outside of the test block
     */
    window.__TESTNAME__ = firstTestName;
    
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
}, 10000);

//Describe block is used to scope test environment.
//Could, for example, set a different beforeEach/afterEach
//function only to be used by tests within the descibe block.
//These unfortunately don't seem to override before/afterEach
//defined in setup_script. Might be a way of doing that.
describe('Description', async () => {
    beforeEach(async () => {

    });
    afterEach(async () => {
        console.log("Shouldn't be taking a screenshot anymore");
    });

    test("Description example", async () => {
        const browser = await window.__BROWSER__;
        window.__TESTNAME__ = "Description example";
        const page = await browser.newPage();
        await run(page);
    }, 10000);
});
