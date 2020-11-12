'use strict';
// Run via `node runtest.js`
// Copied from wwappbase.js/template - because symlinks dont work
// Calls npm run test = jest, with config set in process
const shell = require('shelljs');
const yargv = require('yargs').argv;
const fetch = require('node-fetch');
const os = require('os');
const readline = require('readline');
let config = require('./runtestconfig').config;

// NB: we can't catch --help or help, as node gets them first
if (yargv.support) {
	shell.echo(`
	runtest.js by Good-Loop

Uses jest-puppeteer Doc: https://github.com/smooth-code/jest-puppeteer/blob/master/README.md
Config is set in runtestconfig.js.
Individual configurations can be overriden for a test run using --<config name> <new value>

Options

	--site What server to test? Default is local. Other values are usually "test" and "prod". See testConfig.js
		E.g. to run against the test site, use \`node runtest.js --site test\`
	--head If true (i.e. not headless), launch a browser window for debugging.
	--test <keyword> Use to filter by test. This matches on top-level "describe" names.
	--skipProdTest !!UNSAFE!! Don't test the target site for being production. Only use if you need to test on production site.

Tests are defined in: src/puppeteer-tests/__tests__
(this is where jest-puppeteer looks)
	`);
	return 0; // done
}
shell.echo("Use `node runtest.js --support` for help and usage notes\n");

// Parse arguments...
let argv = process.argv.slice(0, 2);

/**
 * Keyword filter for which tests to run. e.g.
 * `node runtest.js --test advert`
 */
let testPath = '';
/**
 * If true, switch to single-threaded mode
 */
let runInBand = '';

Object.entries(yargv).forEach(([key, value]) => {
	if (key === 'test') { testPath = value; }
	if (key === 'runInBand') { runInBand = '--runInBand'; }

	// Overwrite config properties with command-line arguments? e.g. --site or --head
	if (Object.keys(config).includes(key)) {
		if (typeof config[key] === "boolean") {
			const bool = config[key];
			config[key] = !bool;
		} else config[key] = value;
	}
});

// Store configuration on env
process.env.__CONFIGURATION = JSON.stringify(config);

// Setting real ARGV
process.argv = argv;

const isLocal = config.site === "local";
const baseUrlHasPrefix = config.appURL.split(".").length > 2;
const sitePrefix = config.site === "prod" ? "" : config.site;
const addLeadingDot = !baseUrlHasPrefix && config.site !== "prod"
const infoURL = (isLocal ? "http://" : "https://") + sitePrefix + (addLeadingDot ? "." : "") + config.appURL + config.gitlogPath;

const runTest = () => {
	shell.exec(`npm run test ${testPath} ${runInBand}`);
};

if (!yargv.skipProdTest) {
	// Check tests are not running on production
	// Assumes that gitlog.txt has been built by npm run compile
	// Assumes anything other than test or local hostname is production
	console.log("Checking gitlog for host type...");
	fetch(infoURL, { method: 'GET', timeout:10000 })
		.then(res => {
			if (res.ok) return res.text();
			return res.status;
		})
		.then(gitlog => {
			if (Number.isInteger(gitlog)) { // If a number was returned, then the request was not OK
				askToRunTest("Could not get gitlog (status: " + gitlog + "). Continue? (y/n) ");
			} else {
				const hostname = gitlog.split('\n')[0].replace(/HOST:\t/g, "");
				// test server hostname = baker
				// local server hostname = this machine's name
				// anything else = assume production
				const isNotProduction = hostname === config.testHostname || hostname === os.hostname();
				if (isNotProduction) {
					// Execute Jest. Specific target optional.
					console.log("Hostname " + hostname + " is safe to test");
					runTest();
				} else {
					console.log("Hostname " + hostname + " is not " + config.testHostname + " or " + os.hostname() + ", assuming production and aborting test!");
				}
			}
		})
		.catch(err => {
			console.log(err);
			askToRunTest("Could not get gitlog (error above). Continue? (y/n) ");
		});
} else {
	console.log("Skipping test for production - unsafe!!");
	runTest();
}

const askToRunTest = (question) => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question(question, answer => {
		if (answer.toLowerCase() === "y") {
			runTest();
		} else {
			console.log("Aborting test");
		}
		rl.close();
	});
};

