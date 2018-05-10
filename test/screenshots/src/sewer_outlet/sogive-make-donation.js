let run = (() => {
    var _ref = _asyncToGenerator(function* (page) {
        yield Search.goto(page);
        yield Search.search({ page, search_term: 'oxfam' });
        yield Search.gotoResult({ page, selectorOrInteger: 1 });
        //page .loaded didn't seem to work here.
        yield timeout(5000);
        yield Donation.donate({ page });
    });

    return function run(_x) {
        return _ref.apply(this, arguments);
    };
})();

//Still need to define conditions for success/failure
//Should report this back to test-manager

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const puppeteer = require('puppeteer');
const Search = require('./sogive-scripts/sogive.org_search');
const Donation = require('./sogive-scripts/sogive.org_charity');
const { timeout } = require('./res/UtilityFunctions');

module.exports = { run };
