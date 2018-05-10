let run = (() => {
    var _ref = _asyncToGenerator(function* ({ page }) {
        yield Search.goto({ page });
        yield Search.search({ page, search_term: 'oxfam' });
        yield Search.gotoResult({ page, selectorOrInteger: 1 });
    });

    return function run(_x) {
        return _ref.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { Search } = require('./sogive-scripts/sogive.org_search');
const { Donation } = require('./sogive-scripts/sogive.org_charity');
