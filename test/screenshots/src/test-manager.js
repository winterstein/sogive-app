/**Runs selected suite of tests
 * Should be able to manage from the console.
 */
const puppeteer = require('puppeteer');
const firstTest = require('./sogive-make-donation');
const {onFail, writeToLog} = require('./res/UtilityFunctions');
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

async function init() {
	browser = await puppeteer.launch({headless});
	page = await browser.newPage();
}

async function startTests() {
	//Probably want to warn rather than throw error
	//Might be very annoying if it shuts-down a time-consuming build process
	if(!page) throw new Error('test-manager.js -- invalid page object. Check that init() has been called first');
	if(!tests) throw new Error('test-manager.js -- no tests provided (tests[] is falsy)');

	for (let i=0; i < tests.length; i++) {
		try {
			await tests[i].run(page);
			test_results[i] = {
				success : true
			};
		}
		catch (e) {
			onFail({error: e, page});
			test_results[i] = {
				success: false,
				error: e,
			};
		}
	}
}

/**Currently just a wrapper for writeToLog
 * Will expand to create a nice, human-readable log message
 */
function generateTestReport() {
	if(!test_results) writeToLog(`\n${new Date().toISOString()}: 'test_results[] is blank'}`);
	else writeToLog(`\n${new Date().toISOString()}: ${JSON.stringify(test_results)}`);        
}

async function run() {
	await init();
	await startTests();
	//await browser.close();
	generateTestReport();
}

run();

//Script to run/compile
//Alert if something's gone wrong
//Simple "everything fine" if nothing wrong. Sends out "flag" with details if something's wrong (email to office).
//true/false output for overall results
//Move common non-site specific bits in symlink
// Destructuring assignment in function args
// Import instead of require