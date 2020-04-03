
//import "babel-polyfill"; ??Is this needed?? ^DW April 2018
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import SJTest from 'sjtest';
import {getUrlVars, addScript} from 'wwutils';

import MainDiv from './components/MainDiv';
import Misc from './base/components/Misc';

Misc.FontAwesome = 5;

const container = document.getElementById('mainDiv');
ReactDOM.render(<MainDiv />, container);

// TEST?
// STATUS: experimental! This allows you to load and run a script via the test= parameter
// Use case: run a script, then take a screenshot -- for automated testing.
window.SJTest = SJTest;
window.ReactTestUtils = ReactTestUtils;
const test = getUrlVars().test;
if (test) {
	if (test[0] !== '/') throw new Error("Security defence: do not run test "+test);
	setTimeout(() => {
		addScript(test, () => {
			// on load??
		});
	}, 100);
}
