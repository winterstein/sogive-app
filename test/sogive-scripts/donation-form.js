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

    //Should really have an await here.
    await page.waitForSelector(General.DonationForm.amount);
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
    await advanceWizard({page});

    // await page.waitForSelector(General.DonationForm.Previous);//This condition never triggers for some reason. Only seems to happen for logged-out donations
    // await page.waitForSelector(`label.radio-inline`);
    if(GiftAid) {
        //need to make selectors for fillInForm to work with
        await advanceWizard({page});
    }
    
    if(Details) { 
        await fillInForm({
            page,
            data: Details,
            Selectors: General.DonationForm
        });
    }
    await advanceWizard({page});
    await page.waitForSelector(General.DonationForm.message);

    if(Message) {
        await fillInForm({
            page,
            data: Message,
            Selectors: General.DonationForm
        });
        await advanceWizard({page});
    }

    //Sometimes Stripe button appears, sometimes not
    // if(!await page.$(General.DonationForm.Submit)) {    
    //     await page.click(General.DonationForm.Stripe);
    //     //Not possible to use selectors for emergent menu. Need to use coordinates
        
    // }
    //For traditional (non-Stripe) page
    if(Payment) {
        await page.waitForSelector(General.DonationForm.cvc);
        await fillInForm({
            page,
            data: Payment,
            Selectors: General.DonationForm
        });
    }
    //Click actual submit button if card details were provided.    
    if(Payment && Payment["card-number"]) {
        await page.click(General.DonationForm.Submit);
    }
    else{
        await page.click(General.DonationForm.TestSubmit);
    }

    //Wait for Receipt to appear before closing
    await page.waitForSelector(`div.WizardStage > div.text-center`);
}

async function advanceWizard({page}) {
    const url = await page.evaluate(() => window.location.href);
    const stage = url.match(/.*dntnStage=(.?).*/)? url.match(/.*dntnStage=(.?).*/)[1] : 0;
    let gotoURL;
    if(url.includes('dntnStage')) {
        gotoURL = url.replace(/(.*)(dntnStage=.?)(.*)/, `$1dntnStage=${+stage+1}$3`);
    }
    else if(url.includes('?')) {
        gotoURL = url + `&dntnStage=${+stage+1}`;
    }
    else{
        gotoURL = url+`?dntnStage=${+stage+1}`;
    }
    await page.goto(gotoURL);
}

module.exports = {
    donate
};
