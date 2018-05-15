const puppeteer = require('puppeteer');
const {disableAnimations} = require('../res/UtilityFunctions');

const DONATE_BUTTON = `div.donate-button button`;
//For fields/buttons in wizard
const NEXT_BUTTON = `div.WizardStage div.nav-buttons.clearfix button.pull-right`;
const SUBMIT = `div.WizardStage > div.section.donation-amount > form > button`;
const TEST_SUBMIT = `div.WizardStage > div.section.donation-amount > small > button`;
const AMOUNT_FIELD = `div.WizardStage > div.section.donation-amount > div.form-group > span > input`;
const HIDE_AMOUNT = `div.WizardStage > div.section.donation-amount > div:nth-child(2) > div > label > input[type="checkbox"]`;

/**Fills in the donation form with details provided
 * All of these can be left blank for a £10 anonymous donation
 */
async function donate({
    page, 
    amount, 
    hideAmount,
    giftAid,
    details,
    payment
}) {
	await page.click(DONATE_BUTTON);
    //Each statement represents a stage of the form wizard
    if(amount) {
        await page.click(AMOUNT_FIELD);
        //clear field of default value
        await page.keyboard.down('Control');
        await page.keyboard.press('Backspace');
        await page.keyboard.up('Control');

        await page.keyboard.type(`${amount}`);
    }
    if(hideAmount) {
        //tick checkbox
        await page.click(HIDE_AMOUNT);
    }
    await next({page});

    if(giftAid){
        //switch to check various options
    }
    await next({page});

    if(details){
        //fill in form with corresponding details
    }
    await next({page});
    
    if(payment){
        //fill in payment form amd submit
    }
    //page.click("deliberately-break");
}

/**Advances through the donation form wizard */
async function next({page}) {
    await page.click(NEXT_BUTTON);
}

async function submit({page}) {
    await page.click(SUBMIT);
}

/**Submit payment form via "test: pretend I paid" */
async function testSubmit({page}) {
    await page.click(TEST_SUBMIT);
}

async function goto({page, charityId}) {
    await page.goto(`https://test.sogive.org/#charity?charityId=${charityId}`);
    await page.addScirptTag(disableAnimations);
}

module.exports = {
    donate,
    goto,
	submit,
	testSubmit
};
