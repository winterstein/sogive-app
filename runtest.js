'use strict';

// Useful docs:
//  - https://github.com/smooth-code/jest-puppeteer/blob/master/README.md

// Copied from wwappbase.js/template - because symlinks dont work
// Calls npm run test = jest, with config set in process
const shell = require('shelljs');
const yargv = require('yargs').argv;

let config = {
	// To run against the test site, use `node runtest.js --site test`
	site: 'local',
	unsafe: false,
	vert: '',
	// Used by jest-puppeteer.config.js to launch an actual browser for debugging
	// e.g. `node runtest.js --head`
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

Object.entries(yargv).forEach(([key, value]) => {
	if (key === 'test') { testPath = value; }
	if (key === 'runInBand') { runInBand = '--runInBand'; }
	// ??
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

// Execute Jest. Specific target optional.
// NB: test=jest
shell.exec(`npm run test ${testPath} ${runInBand}`);
