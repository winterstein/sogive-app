

/**Just a stub for now
 * Should go through donation process
 * Can choose to provide donor details
 */
let donate = (() => {
    var _ref = _asyncToGenerator(function* (args) {
        const {
            page,
            amount,
            giftAid,
            details,
            payment
        } = args;
        yield page.click(DONATE_BUTTON);
        yield page.waitForNavigation();
        yield next({ page });
        //Each statement represents a stage of the form wizard
        if (amount) {
            //change donation amount
        }
        yield page.once('load', _asyncToGenerator(function* () {
            return next({ page });
        }));
        if (giftAid) {
            //switch to check various options
        }
        yield page.once('load', _asyncToGenerator(function* () {
            return next({ page });
        }));
        if (details) {
            //fill in form with corresponding details
        }
        yield page.once('load', _asyncToGenerator(function* () {
            return next({ page });
        }));
        if (payment) {}
        //fill in payment form amd submit

        //page.click("deliberately-break");
    });

    return function donate(_x) {
        return _ref.apply(this, arguments);
    };
})();

/**Advances through the donation form wizard */


let next = (() => {
    var _ref5 = _asyncToGenerator(function* (args) {
        const { page } = args;
        yield page.click(NEXT_BUTTON);
    });

    return function next(_x2) {
        return _ref5.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const puppeteer = require('puppeteer');
const { timeout } = require('../res/UtilityFunctions');

const DONATE_BUTTON = `#charity div.donate-button button`;
const NEXT_BUTTON = `div.WizardStage div.nav-buttons.clearfix button`;

module.exports = {
    donate
};
