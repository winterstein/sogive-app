const puppeteer = require('puppeteer');
const {
    APIBASE,
    disableAnimations
} = require('../test-base/res/UtilityFunctions');
const {
    donate,
    submit,
    testSubmit
} = require('./donation-form');

async function goto({page, charityId}) {
    await page.goto(`${APIBASE}/#charity?charityId=${charityId}`);
    await page.addScirptTag(disableAnimations);
}

module.exports = {
    donate,
    goto,
	submit,
	testSubmit
};
