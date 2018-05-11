let init = (() => {
	var _ref = _asyncToGenerator(function* () {
		browser = yield puppeteer.launch({ headless });
		page = yield browser.newPage();
	});

	return function init() {
		return _ref.apply(this, arguments);
	};
})();

let startTests = (() => {
	var _ref2 = _asyncToGenerator(function* () {
		//Probably want to warn rather than throw error
		//Might be very annoying if it shuts-down a time-consuming build process
		if (!page) throw new Error('test-manager.js -- invalid page object. Check that init() has been called first');
		if (!tests) throw new Error('test-manager.js -- no tests provided (tests[] is falsy)');

		for (let i = 0; i < tests.length; i++) {
			try {
				yield tests[i].run(page);
				test_results[i] = {
					success: true
				};
			} catch (e) {
				onFail({ error: e, page });
				test_results[i] = {
					success: false,
					error: e
				};
			}
		}
	});

	return function startTests() {
		return _ref2.apply(this, arguments);
	};
})();

/**Currently just a wrapper for writeToLog
 * Will expand to create a nice, human-readable log message
 */


let run = (() => {
	var _ref3 = _asyncToGenerator(function* () {
		yield init();
		yield startTests();
		//await browser.close();
		generateTestReport();
	});

	return function run() {
		return _ref3.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**Runs selected suite of tests
 * Should be able to manage from the console.
 */
const puppeteer = require('puppeteer');
const firstTest = require('./sogive-make-donation');
const { onFail, writeToLog } = require('./res/UtilityFunctions');
/**TODO
 * Read headless from console
 * Find a better way of sharing page throughout system
 * Produce report of successes/failures of all tests run
 * How to decide if a final state should be counted as a success/failure?
 * Build on error given to include more detailed stack-trace
 * Have tests time-out -- seen it get stuck a couple of times
 * Possibly reattempt test? Best of three maybe? Balance between accuracy/speed to be struck
 * How to marry .txt log and screenshots?
 */
const headless = false;
let browser;
let page;

//Objects in tests[] should contain a run(page) method.
const tests = [firstTest];
//[{success: true}, {success: false, error: ErrorObject}]
const test_results = [];

function generateTestReport() {
	if (!test_results) writeToLog(`\n${new Date().toISOString()}: 'test_results[] is blank'}`);else writeToLog(`\n${new Date().toISOString()}: ${JSON.stringify(test_results)}`);
}

run();

//Script to run/compile
//Alert if something's gone wrong
//Simple "everything fine" if nothing wrong. Sends out "flag" with details if something's wrong (email to office).
//true/false output for overall results
//Move common non-site specific bits in symlink
// Destructuring assignment in function args
// Import instead of require
