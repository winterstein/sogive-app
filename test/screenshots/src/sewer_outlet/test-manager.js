let init = (() => {
    var _ref = _asyncToGenerator(function* () {
        browser = yield puppeteer.launch({ headless });
        page = yield browser.newPage();
    });

    return function init() {
        return _ref.apply(this, arguments);
    };
})();

let startTests = (() => {
    var _ref2 = _asyncToGenerator(function* () {
        if (!page) throw new Error('test-manager.js -- invalid page object. Check that init() has been called first');

        //Just manually adding these in right now. Could possibly have script compile all scripts to run into a single js file and call it here.
        //Would be a bit less hassle in the long run
        yield firstTest.run(page);
    });

    return function startTests() {
        return _ref2.apply(this, arguments);
    };
})();

let run = (() => {
    var _ref3 = _asyncToGenerator(function* () {
        yield init();
        yield startTests();
    });

    return function run() {
        return _ref3.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**Runs selected suite of tests
 * Should be able to manage from the console.
 */
const puppeteer = require('puppeteer');
const firstTest = require('./sogive-make-donation');

//TODO read headless from console.
const headless = false;
let browser;
let page;

run();
