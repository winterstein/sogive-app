'use strict';
// Copied from wwappbase.js/template - because symlinks dont work
// Calls npm run test = jest, with config set in process
const shell = require('shelljs');
const yargv = require('yargs').argv;

let config = {
	site: 'local',
	unsafe: false,
	vert: '',
	head: true,
	chrome: false,
};

// Parse arguments...
let argv = process.argv.slice(0, 2);
// testPath ??format??
// runInBand ??options??
let testPath = '';
let runInBand = '';

Object.entries(yargv).forEach(([key, value]) => {
	if (key === 'test') { testPath = value; }
	if (key === 'runInBand') { runInBand = '--runInBand'; }

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
shell.exec(`npm run test${' ' + testPath} ${runInBand}`);
