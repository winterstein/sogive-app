

/**Fills in the donation form with details provided
 * All of these can be left blank for a £10 anonymous donation
 */
let donate = (() => {
    var _ref = _asyncToGenerator(function* ({
        page,
        amount,
        hideAmount,
        giftAid,
        details,
        payment
    }) {
        yield page.click(DONATE_BUTTON);
        //Each statement represents a stage of the form wizard
        if (amount) {
            yield page.click(AMOUNT_FIELD);
            //clear field of default value
            yield page.keyboard.down('Control');
            yield page.keyboard.press('Backspace');
            yield page.keyboard.up('Control');

            yield page.keyboard.type(`${amount}`);
        }
        if (hideAmount) {
            //tick checkbox
            yield page.click(HIDE_AMOUNT);
        }
        yield next({ page });

        if (giftAid) {
            //switch to check various options
        }
        yield next({ page });

        if (details) {
            //fill in form with corresponding details
        }
        yield next({ page });

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
    var _ref2 = _asyncToGenerator(function* ({ page }) {
        yield page.click(NEXT_BUTTON);
    });

    return function next(_x2) {
        return _ref2.apply(this, arguments);
    };
})();

let submit = (() => {
    var _ref3 = _asyncToGenerator(function* ({ page }) {
        yield page.click(SUBMIT);
    });

    return function submit(_x3) {
        return _ref3.apply(this, arguments);
    };
})();

/**Submit payment form via "test: pretend I paid" */


let testSubmit = (() => {
    var _ref4 = _asyncToGenerator(function* ({ page }) {
        yield page.click(TEST_SUBMIT);
    });

    return function testSubmit(_x4) {
        return _ref4.apply(this, arguments);
    };
})();

let goto = (() => {
    var _ref5 = _asyncToGenerator(function* ({ page, charityId }) {
        yield page.goto(`https://test.sogive.org/#charity?charityId=${charityId}`);
        yield page.addScirptTag(disableAnimations);
    });

    return function goto(_x5) {
        return _ref5.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const puppeteer = require('puppeteer');
const { disableAnimations } = require('../res/UtilityFunctions');

const DONATE_BUTTON = `div.donate-button button`;
//For fields/buttons in wizard
const NEXT_BUTTON = `div.WizardStage div.nav-buttons.clearfix button.pull-right`;
const SUBMIT = `div.WizardStage > div.section.donation-amount > form > button`;
const TEST_SUBMIT = `div.WizardStage > div.section.donation-amount > small > button`;
const AMOUNT_FIELD = `div.WizardStage > div.section.donation-amount > div.form-group > span > input`;
const HIDE_AMOUNT = `div.WizardStage > div.section.donation-amount > div:nth-child(2) > div > label > input[type="checkbox"]`;

module.exports = {
    donate,
    goto,
    submit,
    testSubmit
};
