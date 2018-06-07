/**Will likely roll this into fundraiser. Is a lot of cross-over between the two */
const puppeteer = require('puppeteer');
const {Fundraiser, General, Register} = require('./Selectors');
const {APIBASE, fillInForm, eventIdFromName} = require('../test-base/res/UtilityFunctions');

/**Go to register page for given fundraiser
 * Note: unlike other goto methods, this one actually requires an ID
 */
async function goto({page, fundName, eventId}) {
    if(fundName) {
        //Ensure that we are already on the event page
        const ID = await eventIdFromName({page, eventName: fundName});
        await goto({page, eventId: ID});
    }
    else{
        await page.goto(`${APIBASE}#register/${eventId}`);   
        await page.waitForSelector(Register.Add);
    }
}
/**
 * 
 * @param Charity {charity} 
 * The second part of this, setting up the fundraiser, should maybe be split of into another function
 * Having them together makes it a bit harder to understand what this function is actually doing
 */
async function completeForm({
    page, 
    Charity,
    Details,
    Payment,
    EditFundraiser
}) {
    await page.waitForSelector(Register.EmptyBasket);
    page.click(Register.EmptyBasket);
    await page.waitForSelector(General.Loading);
    await page.waitForSelector(General.Loading, {hidden: true});

    await page.click(Register.Add);

    await advanceWizard({page});      
    //Will fail if user is not already logged-in
    await advanceWizard({page});      

    //fill in Details
    await advanceWizard({page});      
    
    //Your Charity
    if(Charity) await fillInForm({page, data: Charity, Selectors: Register});
    if(await page.$eval(Register['select-first-charity-checkbox'], e => e)) await page.click(Register['select-first-charity-checkbox']);
    await advanceWizard({page});      

    //Checkout
    //Special case to deal with button being different where event ticket price is set to £0
    if (await page.$(Register.FreeTicketSubmit) !== null) {
        await page.click(Register.FreeTicketSubmit);
    }    
    else if(Payment) {
        await fillInForm({page, data: Payment, Selectors: General.DonationForm});
        await page.click(Register.Submit);
    }
    else{
        await page.click(Register.TestSubmit);
    }
    await page.waitForSelector(Register.SetupFundraiser);
    await page.click(Register.SetupFundraiser);
    await page.waitForSelector(`#editFundraiser > div > div.padded-block > div:nth-child(5) > div > div.pull-left > div`);
    await fillInForm({page, data: EditFundraiser, Selectors: Fundraiser.EditFundraiser});
    //Wait for publish to go through before returning control. Quite a crude method, using waitForNavigation wasn't working
    await page.click(General.CRUD.Publish);
    await page.waitForSelector(`${General.CRUD.Publish}[disabled]`, {hidden: true});
}

async function advanceWizard({page}) {
    const url = await page.evaluate(() => window.location.href);
    const stage = url.match(/.*registerStage=(.?).*/)? url.match(/.*registerStage=(.?).*/)[1] : 0;
    let gotoURL;
    if(url.includes('registerStage')) {
        gotoURL = url.replace(/(.*)(registerStage=.?)(.*)/, `$1registerStage=${+stage+1}$3`);
    }
    else if(url.includes('?')) {
        gotoURL = url + `&registerStage=${+stage+1}`;
    }
    else{
        gotoURL = url+`?registerStage=${+stage+1}`;
    }
    await page.goto(gotoURL);
}


module.exports = {
    completeForm,
    goto
};
