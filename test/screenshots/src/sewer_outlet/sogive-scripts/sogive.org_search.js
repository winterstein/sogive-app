

//Need some kind of time-out functionality for these

//Page-specific actions likely to be used during testing
let search = (() => {
    var _ref = _asyncToGenerator(function* (args) {
        const { page, search_term } = args;

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

/**Loads page to which the current js file pertains  
 * Would be nice to find a better way of sharing the page object around. Bit of a pain in the arse
*/


let goto = (() => {
    var _ref3 = _asyncToGenerator(function* (page) {
        yield page.goto('http://test.sogive.org/#search?q=');
    });

    return function goto(_x3) {
        return _ref3.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const puppeteer = require('puppeteer');

//CSS selectors for important elements on page
//Concerned that these are too susceptible to changes in DOM structure
//Could potentially add fixed classes/ids to elements in future to make tests more reliable
const SEARCH_FIELD = `#formq`;
const SEARCH_BUTTON = `span.sogive-search-box.input-group-addon`;
const RESULTS_LIST = `#search div.results-list`;

module.exports = {
    goto,
    search,
    gotoResult
};
