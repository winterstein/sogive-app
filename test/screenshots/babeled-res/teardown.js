'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const chalk = require('chalk');
const puppeteer = require('puppeteer');
const { takeScreenshot } = require('./UtilityFunctions');
const fs = require('fs');
const os = require('os');
const path = require('path');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

//This actually seems to be the place to setup screenshotting. 
//Still have access to the browser object via the temporary directory
//Very interesting technique. Can this be used to pass objects around in general?
//No. Specific WebSocket-related thing
module.exports = _asyncToGenerator(function* () {
  const wsEndpoint = fs.readFileSync(path.join(DIR, 'wsEndpoint'), 'utf8');
  if (!wsEndpoint) {
    throw new Error('wsEndpoint not found');
  }
  const __BROWSER__ = yield puppeteer.connect({
    browserWSEndpoint: wsEndpoint
  });

  const pages = yield __BROWSER__.pages();

  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];
    yield takeScreenshot(page);
  }

  yield __BROWSER__.close();
});
