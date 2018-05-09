

//Quick scraping experiment
//Want to know how strict DOM selectors need to be to find correct element
//Feel that this would be more robust than clicking on predetermined part of screen, 
//but it could end up being fairly fragile.

let run = (() => {
    var _ref = _asyncToGenerator(function* () {
        //Want to be able to override these with console args later
        const args = {
            headless: true,
            APIBASE: 'http://local.sogive.org'
        };

        const CREATE_BUTTON = '#editEvent > div > button';
        let page;
        let browser;

        try {
            browser = yield puppeteer.launch(args);
            page = yield browser.newPage();

            yield page.goto(`${args.APIBASE}/#editEvent/`);
            yield page.click(CREATE_BUTTON);
        } catch (error) {
            yield UtilityFunctions.onFail({ page, error });
            browser.close();
        }
    });

    return function run() {
        return _ref.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const puppeteer = require('puppeteer');
const UtilityFunctions = require('./UtilityFunctions');

run();
