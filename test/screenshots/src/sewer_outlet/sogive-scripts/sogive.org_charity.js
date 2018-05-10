

/**Just a stub for now
 * Should go through donation process
 * Can choose to provide donor details
 */
let donate = (() => {
    var _ref = _asyncToGenerator(function* (args) {
        const { page } = args;
        yield page.click(DONATE_BUTTON);
    });

    return function donate(_x) {
        return _ref.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const puppeteer = require('puppeteer');

const DONATE_BUTTON = `#charity div.donate-button button`;

module.exports = {
    donate
};
