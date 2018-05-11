const puppeteer = require('puppeteer');
const {timeout} = require('../res/UtilityFunctions');

const DONATE_BUTTON = `#charity div.donate-button button`;
const NEXT_BUTTON = `div.WizardStage div.nav-buttons.clearfix button`;

/**Just a stub for now
 * Should go through donation process
 * Can choose to provide donor details
 */
async function donate(args) {
    const {
        page, 
        amount, 
        giftAid,
        details,
        payment
    } = args;
    await page.click(DONATE_BUTTON);
    await timeout(1000);
    await next({page});
    //Each statement represents a stage of the form wizard
    if(amount) {
        //change donation amount
    }
    await page.once('load', async () => next({page}));
    if(giftAid){
        //switch to check various options
    }
    await page.once('load', async () => next({page}));
    if(details){
        //fill in form with corresponding details
    }
    await page.once('load', async () => next({page}));
    if(payment){
        //fill in payment form amd submit
    }
    //page.click("deliberately-break");
}

/**Advances through the donation form wizard */
async function next(args) {
    const {page} = args;
    await page.click(NEXT_BUTTON);
}

module.exports = {
    donate
};
