'use strict';

/**Might actually be a good idea to add CSS selectors for certain elements in here
 * Many parts of page are generated from common source: will be identified by common CSS selector
 * Could end up being more flexible having these defined in here, so that changes in source code
 * are easy to mirror in test setup. Would have to go spelunking through a raft of files otherwise.
 */

/**Currently want to take screenshot and take a note of any errors */
//Any circumstance under which call to process.arg[1] would return something bad?
//Probably will discontinue use of this function. Lot of functionality needed on success as well as failure.
let onFail = (() => {
    var _ref = _asyncToGenerator(function* ({ error, page }) {
        yield takeScreenshot(page);
    });

    return function onFail(_x) {
        return _ref.apply(this, arguments);
    };
})();

//Maybe save screenshots to directory named after test run?
//Going to be quite difficult figuring out what's what in there


let takeScreenshot = (() => {
    var _ref2 = _asyncToGenerator(function* (page) {
        const folderPath = `test-screenshots`;

        try {
            yield page.screenshot({ path: `${folderPath}/${new Date().toISOString()}.png` });
        } catch (e) {
            //dir not found
            //Shouldn't give infinite loop: mkdirSync throws error if directory can't be created
            if (e.code === 'ENOENT') {
                fs.mkdirSync(folderPath);
                yield takeScreenshot(page);
            } else {
                console.log('Screenshot failed: ' + e.message);
            }
        }
    });

    return function takeScreenshot(_x2) {
        return _ref2.apply(this, arguments);
    };
})();

/**Login to app. Should work for both SoGive and Good-loop */
let login = (() => {
    var _ref3 = _asyncToGenerator(function* ({ page, username, password }) {
        if (!username || !password) throw new Error('UtilityFunctions -- no username/password provided to login');
        yield page.click('#top-right-menu > li > a');
        yield page.click('#loginByEmail > div:nth-child(1) > input');
        yield page.keyboard.type(username);
        yield page.click('#loginByEmail > div:nth-child(2) > input');
        yield page.keyboard.type(password);
    });

    return function login(_x3) {
        return _ref3.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs');

/**Used to disable all page animations
 * Found that these were making tests less reliable
 * Insert into page via page.addScriptTag(disableAnimations);
 */
const disableAnimations = {
    content: `function disableAnimations() {
            var jQuery = window.jQuery;
            if ( jQuery ) {
                jQuery.fx.off = true;
            }

            var css = document.createElement( "style" );
            css.type = "text/css";
            css.innerHTML = "* { -webkit-transition: none !important; transition: none !important; -webkit-animation: none !important; animation: none !important; }";
            document.body.appendChild( css );
        }

        if ( document.readyState !== "loading" ) {
            disableAnimations();
        } else {
            window.addEventListener( 'load', disableAnimations, false );
        }`
};

function writeToLog(string) {
    fs.appendFileSync('log.txt', string);
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    disableAnimations,
    onFail,
    takeScreenshot,
    timeout,
    writeToLog
};
