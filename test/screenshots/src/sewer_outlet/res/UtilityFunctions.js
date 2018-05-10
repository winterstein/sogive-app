

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs');

function writeToLog() {}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    onFail,
    timeout,
    takeScreenshot
};
