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
        //Probably want to warn rather than throw error
        //Might be very annoying if it shuts-down a time-consuming build process
        if (!page) throw new Error('test-manager.js -- invalid page object. Check that init() has been called first');
        if (!tests) throw new Error('test-manager.js -- no tests provided (tests[] is falsy)');

        for (let i = 0; i < tests.length; i++) {
            try {
                yield tests[i].run(page);
                test_results[i] = {
                    success: true
                };
            } catch (e) {
                test_results[i] = {
                    success: false,
                    error: e
                };
                onFail({ error: e, page });
            }
        }
    });

    return function startTests() {
        return _ref2.apply(this, arguments);
    };
})();

let run = (() => {
    var _ref3 = _asyncToGenerator(function* () {
        yield init();
        yield startTests();
        browser.close();
        //Output test report
        //Error thrown currently doesn't make clear where it's coming from
        //Would be nice if it could be more descriptive for output to log
        console.log(test_results);
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
const { onFail } = require('./res/UtilityFunctions');
/**TODO
 * Read headless from console
 * Find a better way of sharing page throughout system
 * Produce report of successes/failures of all tests run
 * Build on error given to include more detailed stack-trace
 */
const headless = false;
let browser;
let page;

const tests = [firstTest];
const test_results = [];

run();
