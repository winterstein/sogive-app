const puppeteer = require('puppeteer');
const {
    APIBASE,
    disableAnimations
} = require('../test-base/res/UtilityFunctions');
const {
    donate,
} = require('./donation-form');

async function goto({page, charityId}) {
    page.goto(`${APIBASE}/#charity?charityId=${charityId}`);
    await page.waitForSelector('.loader-box');    
    await page.waitForSelector('.loader-box', {hidden: true}); 
}

module.exports = {
    donate,
    goto
};
