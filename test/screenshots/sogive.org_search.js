

//Need some kind of time-out functionality for these

//Page-specific actions likely to be used during testing
let search = (() => {
    var _ref = _asyncToGenerator(function* (args) {
        const { page, search_term } = args;

        yield page.goto('http://test.sogive.org/#search?q=');

        yield page.click(SEARCH_FIELD);
        yield page.keyboard.type(search_term);
        yield page.click(SEARCH_BUTTON);
    });

    return function search(_x) {
        return _ref.apply(this, arguments);
    };
})();
/**Can specify result to click by either charityId or position in results list. 
 * NOTE: will throw an error if specified result is not found
*/


let gotoResult = (() => {
    var _ref2 = _asyncToGenerator(function* (args) {
        const { page } = args;
        const { selectorOrInteger } = args || 1; //Attempts to retrieve first result by default
        let result_selector = RESULTS_LIST;

        if (Number.isInteger(selectorOrInteger)) result_selector += ` div:nth-child(${selectorOrInteger})`;
        if (typeof selectorOrInteger === 'string') result_selector += ` ${selectorOrInteger}`;
        result_selector += ` a`;

        yield page.click(result_selector);
    });

    return function gotoResult(_x2) {
        return _ref2.apply(this, arguments);
    };
})();

//Could possibly export for master script to handle
//Might be a bit too restrictive only handing out completed tests
//Certain tests will require working across various pages
//Could, then, export a list of basic actions to be combined into usable tests externally
//=> page declarations should be a collection of useful building blocks by page


let run = (() => {
    var _ref3 = _asyncToGenerator(function* () {
        //Later want global start() method to create new page on init
        const browser = yield puppeteer.launch({ headless });
        const page = yield browser.newPage();

        yield search({ page, search_term: 'oxfam' });
        yield gotoResult({ page, selectorOrInteger: 1 });
    });

    return function run() {
        return _ref3.apply(this, arguments);
    };
})();
//#search > div > div:nth-child(2) > div > div.results-list > div:nth-child(1) > div > a


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const puppeteer = require('puppeteer');
const { onFail } = require('./UtilityFunctions');

const headless = false;

//CSS selectors for important elements on page
//Concerned that these are too susceptible to changes in DOM structure
//Could potentially add fixed classes/ids to elements in future to make tests more reliable
const SEARCH_FIELD = `#formq`;
const SEARCH_BUTTON = `span.sogive-search-box.input-group-addon`;
const RESULTS_LIST = `#search div.results-list`;run();
