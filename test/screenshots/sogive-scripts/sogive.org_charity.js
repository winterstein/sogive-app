const puppeteer = require('puppeteer');
const {disableAnimations} = require('../res/UtilityFunctions');

const DONATE_BUTTON = `div.donate-button button`;
//For fields/buttons in wizard
//Generic
const NEXT_BUTTON = `div.WizardStage div.nav-buttons.clearfix button.pull-right`;
//Amount
const AMOUNT_FIELD = `div.WizardStage > div.section.donation-amount > div.form-group > span > input`;
const HIDE_AMOUNT = `div.WizardStage > div.section.donation-amount > div:nth-child(2) > div > label > input[type="checkbox"]`;
//Details
const NAME_FIELD = `body > div:nth-child(14) > div.fade.donate-modal.in.modal > div > div > div.modal-body > div > div.WizardStage > div.section.donation-amount > div:nth-child(2) > input`;
const EMAIL_FIELD = `div.WizardStage > div.section.donation-amount > div:nth-child(3) > input`;
const ADDRESS_FIELD = `div.WizardStage > div.section.donation-amount > div:nth-child(4) > input`;
const POSTCODE_FIELD = `div.WizardStage > div.section.donation-amount > div:nth-child(5) > input`;
const CONSENT_CHECKBOX = `div.WizardStage > div.section.donation-amount > div:nth-child(6) > div > label > input[type="checkbox"]`;
const ANON_CHECKBOX = `div.WizardStage > div.section.donation-amount > div:nth-child(7) > div > label > input[type="checkbox"]`;
//Payment
const SUBMIT = `div.WizardStage > div.section.donation-amount > form > button`;
const TEST_SUBMIT = `div.WizardStage > div.section.donation-amount > small > button`;

/**Fills in the donation form with details provided
 * All of these can be left blank for a £10 anonymous donation
 * @param details {name: '', email: '', address: '', postcode: '', charityConsent: bool, anon: bool}
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

    if(details) {
        //{name: '', email: '', address: '', postcode: '', charityConsent: bool, anon: bool}
        const keys = Object.keys(details);
        //fill in form with corresponding details        
        for(let i = 0; i<keys.length; i++) {
            let key = keys[i];
            if (key==='name') {
                await page.click(NAME_FIELD);
                await page.keyboard.type(details[key]);
            }
            else if(key==='email') {              
                await page.click(EMAIL_FIELD);
                await page.keyboard.type(details[key]);
            } 
            else if(key==='address') {            
                await page.click(ADDRESS_FIELD);
                await page.keyboard.type(details[key]);
            }
            else if(key==='postcode') {              
                await page.click(POSTCODE_FIELD);
                await page.keyboard.type(details[key]);
            }
            else if(key === 'charityConsent') {
                await page.click(CONSENT_CHECKBOX);
            }
            else if(key === 'anon') {
                await page.click(ANON_CHECKBOX);
            }
        }
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
