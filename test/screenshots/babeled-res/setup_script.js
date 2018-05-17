'use strict';

//Maybe save screenshots to directory named after test run?
//Going to be quite difficult figuring out what's what in there
let takeScreenshot = (() => {
    var _ref3 = _asyncToGenerator(function* (page) {
        const screenshot_folder_path = `${SCREENSHOT_FOLDER_BASE}/${new Date().toISOString().slice(0, 10)} : ${window.__TESTNAME__ || 'UnknownTest'}`;
        try {
            yield page.screenshot({ path: `${screenshot_folder_path}/${new Date().toISOString()}.png` });
        } catch (e) {
            //dir not found
            //Shouldn't give infinite loop: mkdirSync throws error if directory can't be created
            if (e.code === 'ENOENT') {
                fs.mkdirSync(screenshot_folder_path);
                yield takeScreenshot(page);
            } else {
                console.log('setup_script.js -- screenshot failed ' + e.code + ': ' + e.message);
            }
        }
    });

    return function takeScreenshot(_x) {
        return _ref3.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**NOTE: This file needs to be babeled under current setup.
 * compile.sh set to output to babeled-res. That's also
 * where jest is set to read the setup file from
 */
const puppeteer = require('puppeteer');
const fs = require('fs');

const headless = true;
const SCREENSHOT_FOLDER_BASE = `test-screenshots`;

/**Setup functions run before each test
 * If you only want something to run once
 * before all tests in file, use beforeAll/afterAll
 */
beforeEach(_asyncToGenerator(function* () {
    //Can't access global from tests
    window.__BROWSER__ = yield puppeteer.launch({ headless });
}));

/**Cleanup after each test is completed
 * Note: some after-test functionality is 
 * written in custom-reporter.js
 * Reporters get more info on tests.
 */
afterEach(_asyncToGenerator(function* () {
    const browser = window.__BROWSER__;
    const pages = yield browser.pages();

    //Start at 1 to skip over chrome home page
    for (let i = 1; i < pages.length; i++) {
        yield takeScreenshot(pages[i]);
    }
    yield window.__BROWSER__.close();
}));
