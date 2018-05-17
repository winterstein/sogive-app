/**NOTE: This file needs to be babeled under current setup.
 * compile.sh set to output to babeled-res. That's also
 * where jest is set to read the setup file from
 */
const puppeteer = require('puppeteer');
const fs = require('fs');

const headless = false;
const SCREENSHOT_FOLDER_BASE = `test-screenshots`;

/**Setup functions run before each test
 * If you only want something to run once
 * before all tests in file, use beforeAll/afterAll
 */
beforeEach(async () => {
    //Can't access global from tests
    window.__BROWSER__ = await puppeteer.launch({headless});
});

/**Cleanup after each test is completed
 * Note: some after-test functionality is 
 * written in custom-reporter.js
 * Reporters get more info on tests.
 */
afterEach(async () => {
    const browser = window.__BROWSER__;
    const pages = await browser.pages();

    //Start at 1 to skip over chrome home page
    for(let i=1; i<pages.length; i++) {
        await takeScreenshot(pages[i]);
    }
    await window.__BROWSER__.close();
});

//Maybe save screenshots to directory named after test run?
//Going to be quite difficult figuring out what's what in there
async function takeScreenshot(page) {
    const screenshot_folder_path = `${SCREENSHOT_FOLDER_BASE}/${new Date().toISOString().slice(0,10)} : ${window.__TESTNAME__ || 'UnknownTest'}`;
    try {
        await page.screenshot({path: `${screenshot_folder_path}/${new Date().toISOString()}.png`});
    }
    catch(e) {
        //dir not found
        //Shouldn't give infinite loop: mkdirSync throws error if directory can't be created
        if (e.code === 'ENOENT') {
            fs.mkdirSync(screenshot_folder_path);
            await takeScreenshot(page);
        }
        else{
            console.log('setup_script.js -- screenshot failed ' + e.code + ': ' + e.message);
        }
    }
}
