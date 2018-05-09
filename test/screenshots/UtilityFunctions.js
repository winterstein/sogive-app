

/**Currently want to take screenshot and take a note of any errors */
//Any circumstance under which call to process.arg[1] would return something bad?
let onFail = (() => {
    var _ref = _asyncToGenerator(function* ({ error, page, caller = process.argv[1].split("/").pop() }) {
        const folderPath = `test/${caller}`;

        try {
            yield page.screenshot({ path: `${folderPath}/${new Date().toISOString()}.png` });
        } catch (e) {
            //dir not found
            //Shouldn't give infinite loop: mkdirSync throws error if directory can't be created
            if (e.code === 'ENOENT') {
                fs.mkdirSync(folderPath);
                yield onFail({ error, page, caller });
            } else {
                console.log('Screenshot failed: ' + e.message);
            }
            //TODO write to log
            //Possible to get chromium console output?
        }
    });

    return function onFail(_x) {
        return _ref.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs');

function writeToLog() {}

module.exports = { onFail };
