const puppeteer = require('puppeteer');
const {
    fillInForm,
    disableAnimations,
    APIBASE
} = require('../test-base/res/UtilityFunctions');
const {General} = require('./Selectors');

/**Fills in the donation form with details provided
 * All of these can be left blank for a £10 anonymous donation
 * @param Amount {amount: 0, hide-amount-checkbox: true}
 * @param Details {name: '', email: '', address: '', postcode: '', consent-checkbox: true, anon-checkbox: true}
 */
async function donate({
    page, 
    Amount, 
    GiftAid,
    Details,
    Payment
}) {
	await page.click(General.DonationForm.DonationButton);
    //Amount is a bit of a special case as the field has a default value set.
    //Might want to make fillInForm clear fields by default. Could also pass it a param to say that a field should be cleared.
    if(Amount) {
        await page.click(General.DonationForm.amount);
        //clear field of default value
        await page.keyboard.down('Control');
        await page.keyboard.press('Backspace');
        await page.keyboard.up('Control');

        await page.keyboard.type(`${Amount.amount}`);
    }
    if(Amount && Amount["hide-amount-checkbox"]) {
        await page.click(General.DonationForm["hide-amount-checkbox"]);
    }
    await next({page});

    if(GiftAid) {

    }
    await next({page});

    if(Details) {
        fillInForm({
            page,
            data: Details,
            Selectors: General.DonationForm
        });
    }
    await next({page});
    
    if(Payment) {
        //fill in payment form and submit
    }
    //page.click("deliberately-break");
}

/**Advances through the donation form wizard */
async function next({page}) {
    await page.click(General.DonationForm.Next);
}

async function submit({page}) {
    await page.click(General.DonationForm.Submit);
}

/**Submit payment form via "test: pretend I paid" */
async function testSubmit({page}) {
    await page.click(General.DonationForm.TestSubmit);
}

module.exports = {
    donate,
    submit,
    testSubmit
};
