/**Runs selected suite of tests
 * Should be able to manage from the console.
 */
const puppeteer = require('puppeteer');
const firstTest = require('./sogive-make-donation');

/**TODO
 * Read headless from console
 * Find a better way of sharing page throughout system
 * Produce report of successes/failures of all tests run
 */
const headless = false;
let browser;
let page;

async function init() {
    browser = await puppeteer.launch({headless});
    page = await browser.newPage();
}

async function startTests() {
    if(!page) throw new Error('test-manager.js -- invalid page object. Check that init() has been called first');

    //Just manually adding these in right now. Could possibly have script compile all scripts to run into a single js file and call it here.
    //Would be a bit less hassle in the long run
    await firstTest.run(page);
}

async function run() {
    await init();
    await startTests();
}

run();
