'use strict';

// Copied from wwappbase.js/template - because symlinks dont work
// Calls npm run test = jest, with config set in process
const shell = require('shelljs');
const yargv = require('yargs').argv;
// NB: we can't catch --help or help, as node gets them first
if (yargv.support) {
	shell.echo(`
	runtest.js by Good-Loop

Uses jest-puppeteer Doc: https://github.com/smooth-code/jest-puppeteer/blob/master/README.md

Options

	--site <server> What server to test? Default is local. Other values are usually "test" and "prod". See testConfig.js
		E.g. to run against the test site, use \`node runtest.js --site test\`
	--head Launch a browser window for debugging (i.e. not headless)
	--test <filename> Use to filter by test. This matches on test file names.
	--chrome Run tests in Chrome instead of Puppeteer's default browser (Chromium)

	-- -t <testname> Use to filter by test name. Must be the last option in the command.
	                 (Subsequent options will be ignored.)

Tests are defined in: src/puppeteer-tests/__tests__
(this is where jest-puppeteer looks)
	`);
	return 0; // done
}
shell.echo("Use `node runtest.js --support` for help and usage notes");

let config = {	
	// The possible values for `site` are defined in testConfig.js, targetServers
	site: 'local',
	unsafe: false,
	vert: '',
	// Used by jest-puppeteer.config.js to launch an actual browser for debugging
	head: false,	
	chrome: false,
};

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
/**
 * Filters tests by name (within testPath, if set). e.g.
  * `node runtest.js --test donate -- -t 'Logged-out'`
*/
let testFilter = '';

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
	if (key === '_' && value[0] === '-t') {
		testFilter = `-- -t ${value[1]}`;
	}
});

// Store configuration on env
process.env.__CONFIGURATION = JSON.stringify(config);

// Preserve color of test results output
process.env.FORCE_COLOR = true;

// Setting real ARGV
process.argv = argv;

// Execute Jest. Specific target optional.
shell.exec(`npm run test ${testPath} ${runInBand} ${testFilter}`);
