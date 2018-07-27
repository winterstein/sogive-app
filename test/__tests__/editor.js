// checks functionality of sogive.org/#edit
const puppeteer = require('puppeteer');
const {APIBASE, login, fillInForm} = require('../test-base/res/UtilityFunctions');
const {username, password} = require('../../../logins/sogive-app/puppeteer.credentials');
const {Editor, General} = require('../sogive-scripts/Selectors');
const $ = require('jquery');

// the lucky charity to be tested on
const lamb = "urras-eaglais-na-h-aoidhe";
const timeStamp = new Date().toISOString();

test('Edit and publish field', async () => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    await page.goto(APIBASE + `/#edit?charityId=${lamb}`);
    await login({page, username, password});
    await page.waitFor(Editor.story);
    await fillInForm({page, Selectors: Editor, data: {story: timeStamp}});
    await page.click(General.CRUD.Publish);
}, 20000);

test('Check with back-end that field has been updated', async () => {
    const data = await $.ajax(`/charity/${lamb}.json`);

    if(data.cargo.stories !== timeStamp) {
        throw new Error("SoGive editor does not appear to have updated correctly");
    }
}, 20000);
