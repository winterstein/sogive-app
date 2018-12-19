const puppeteer = require('puppeteer');
const {
    APIBASE,
    disableAnimations
} = require('../test-base/res/UtilityFunctions');

async function goto({page, charityId}) {
    page.goto(`${APIBASE}/#charity?charityId=${charityId}`);
    await page.waitForSelector('#charity > div > div.charity-page.row > div.col-md-7.col-xs-12.column.impact-column > div.donation-column > div.donation-impact > div.below-arrow > div > button');    
}

module.exports = {
    goto
};
