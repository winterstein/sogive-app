const puppeteer = require('puppeteer');
const {onFail} = require('../res/UtilityFunctions');

const DONATE_BUTTON = `#charity div.donate-button button`;

/**Just a stub for now
 * Should go through donation process
 * Can choose to provide donor details
 */
async function donate(args) {
    const {page} = args;
    await page.click(DONATE_BUTTON);
}

module.exports = {
    donate
};
