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
 */
async function completeForm({
    page, 
    Charity,
    Details,
    Payment,
    EditFundraiser
}) {
    await page.click(Register.Add);

    await page.click(Register.Next);
    await page.waitForSelector(Register.Next);        
    //Will fail if user is not already logged-in
    await page.click(Register.Next);
    await page.waitForSelector(Register.Next);     

    //fill in Details
    await page.click(Register.Next);
    await page.waitForSelector(Register.Next);  
    
    //Your Charity
    if(Charity) await fillInForm({page, data: Charity, Selectors: Register});
    if(await page.$eval(Register['select-first-charity-checkbox'], e => e)) await page.click(Register['select-first-charity-checkbox']);
    await page.click(Register.Next);

    //Checkout
    await page.waitForSelector(Register.Submit);    
    if(Payment) {
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

module.exports = {
    completeForm,
    goto
};
