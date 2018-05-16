'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const puppeteer = require('puppeteer');
const { takeScreenshot } = require('./UtilityFunctions');

const headless = false;

beforeAll(_asyncToGenerator(function* () {
    //Can't access global from tests
    window.__BROWSER__ = yield puppeteer.launch({ headless });
}));

afterAll(_asyncToGenerator(function* () {
    const browser = window.__BROWSER__;
    const pages = yield browser.pages();

    //Start at 1 to skip over chrome home page
    for (let i = 1; i < pages.length; i++) {
        yield takeScreenshot(pages[i]);
    }

    yield window.__BROWSER__.close();
}));
