

//Quick scraping experiment
//Want to know how strict DOM selectors need to be to find correct element
//Feel that this would be more robust than clicking on predetermined part of screen, 
//but it could end up being fairly fragile.

let run = (() => {
    var _ref = _asyncToGenerator(function* () {
        const SEARCH_FIELD = `#formq`;
        const SEARCH_BUTTON = `span.sogive-search-box.input-group-addon`;

        const browser = yield puppeteer.launch({ headless });
        const page = yield browser.newPage();

        yield page.goto('http://local.sogive.org/#search?q=');

        yield page.click(SEARCH_FIELD);
        yield page.keyboard.type('oxfam');
        yield page.click(SEARCH_BUTTON);
    });

    return function run() {
        return _ref.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const puppeteer = require('puppeteer');
const UtilityFunctions = require('../res/UtilityFunctions');

const headless = false;

run();
