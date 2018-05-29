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
 * @param Message turns out that charity and fundraiser donation forms are different. This is a hack to allow donate() to be used in both places.
 *  Will consider splitting this up if too many changes are needed.
 */
async function donate({
    page, 
    Amount, 
    GiftAid,
    Details,
    Message,
    Payment
}) {
    await page.waitForSelector(General.DonationForm.DonationButton);
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
    await page.waitForSelector(General.DonationForm.Next);

    if(GiftAid) {
        
    }
    await next({page});
    await page.waitForSelector(General.DonationForm.name);

    if(Details) { 
        await fillInForm({
            page,
            data: Details,
            Selectors: General.DonationForm
        });
    }
    await next({page});
    await page.waitForSelector(General.DonationForm.name, {hidden: true});//Can't wait for element to appear because we don't know if the next pane will be message or payment.
    
    if(Message) {
        await fillInForm({
            page,
            data: Message,
            Selectors: General.DonationForm
        });
        await next({page});
        await page.waitForSelector(General.DonationForm.message, {hidden: true});
    }

    if(Payment) {
        await fillInForm({
            page,
            data: Payment,
            Selectors: General.DonationForm
        });
    }

    //Click actual submit button if card details were provided.
    if(Payment && Payment["card-number"]) {    
        await submit({page});
    }
    else{
        await testSubmit({page});
    }
}

/**Advances through the donation form wizard */
async function next({page}) {
    await page.click(General.DonationForm.Next);
}

//Should maybe change submit and testSubmit to wait until the Thank You! page has appeared before returning control
async function submit({page}) {
    await page.click(General.DonationForm.Submit);
}

/**Submit payment form via "test: pretend I paid" */
async function testSubmit({page}) {
    await page.click(General.DonationForm.TestSubmit);
}

module.exports = {
    donate
};
