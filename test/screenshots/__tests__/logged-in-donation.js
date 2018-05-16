const puppeteer = require('puppeteer');
const {run} = require('../res/sogive-make-donation.js');
const {takeScreenshot} = require('../res/UtilityFunctions');
const fs = require('fs');
const mkdirp = require('mkdirp');
const os = require('os');
const path = require('path');

//This setup isn't going to work for parallel tests.
//They'll all be trying to access the same browser object.
//Quick fix would be to force tests to run in series.

//Must be a nicer alternative. Official Jest example had suggested using global, 
//but that just doesn't work. Suggestion has been dismissed by Jest devs
//If we could get setup.js working, would still need to find some way of
//passing that browser object to test and teardown.js. Not so simple

//Will work as long as each file contains only one test.
//More that it should only require a single browser instance
//Must be a better way of doing this. Just want each test to have
//a browser bound to it. Got to be some way of achieving this

//Figured out that, despite what the Jest devs may claim, window works and global doesn't.
//Setting browser object to window.__BROWSER__ allows it to be accessed
//by test files and teardown. Still need to figure out how to get setup to run for
//each test though.

const headless = false;

describe('Descirption', async () => {  
    it("Makes a donation", async () => {
        const browser = await window.__BROWSER__;
        const page = await browser.newPage();
        await run(page);
    }, 10000);
});
