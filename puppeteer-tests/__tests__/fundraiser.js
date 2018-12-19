const puppeteer = require('puppeteer');
const {APIBASE, eventIdFromName, fillInForm, fundIdByName, login, soGiveFailIfPointingAtProduction} = require('../test-base/res/UtilityFunctions');
const {username, password} = require('../../../logins/sogive-app/puppeteer.credentials');
const {createEvent, deleteEvent} = require('../test-base/babeled-res/UtilsSoGive');
const {SoGiveSelectors: {Fundraiser, General, Register}} = require('../test-base/utils/SelectorsMaster');
const {donate} = require('../sogive-scripts/donation-form');

// Default event data
const eventData = {
    name: Date.now(),
    description: "Resistance is futile",
    "web-page": 'https://developers.google.com/web/tools/puppeteer/',
    "matched-funding": 10,
    sponsor: "Locutus of Borg",

    backdrop: 'https://i.pinimg.com/originals/a4/42/b9/a442b9891265ec69c78187a030b0753b.jpg',

    ticketName: 'Assimile',
    stock: 1000,
    price: 0
};

const fundraiserData = {
    payment: {

    },
    EditFundraiser: {
        name: eventData.name,
        description: "I really hope so"
    }
};

test('Create a fundraiser', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    await page.goto(`${APIBASE}#event`);
    
    await soGiveFailIfPointingAtProduction({page});
    await login({page, username, password});  
    await createEvent({page, data: eventData});

    const eventId = await eventIdFromName({page, eventName: eventData.name});
    await page.goto(`${APIBASE}#register/${eventId}`);

    // Register for the event
    await page.waitForSelector(Register.EmptyBasket);
    await page.click(Register.EmptyBasket);

    await page.waitFor(1500);
    await page.waitForSelector(Register.Add);
    await page.click(Register.Add);

    await page.waitFor(1500);
    await page.waitForSelector(Register.Next);
    await page.click(Register.Next);
    // Will fail if user is not already logged in
    await page.waitFor(1500);
    await page.waitForSelector(Register.Next);    
    await page.click(Register.Next);
    
    await page.waitFor(1500);
    await page.waitForSelector(Register.Next);
    await page.click(Register.Next);

    await fillInForm({page, data: {charity: "puppet"}, Selectors: Register});
    await page.waitFor(1500);
    await page.waitForSelector(Register['select-first-charity-checkbox']);
    await page.click(Register['select-first-charity-checkbox']);

    await page.waitForSelector(Register.Next);
    await page.click(Register.Next);

    //Checkout
    //Special case to deal with button being different where event ticket price is set to £0
    if (await page.$(Register.FreeTicketSubmit) !== null) {
        await page.click(Register.FreeTicketSubmit);
    }    
    else{
        await fillInForm({page, data: fundraiserData.payment, Selectors: General.CharityPageImpactAndDonate});
        await page.click(Register.TestSubmit);
    }

    // Setting up the actual fundraiser
    await page.waitForSelector(Register.SetupFundraiser);
    await page.click(Register.SetupFundraiser);
    await page.waitForSelector(`#editFundraiser > div > div.padded-block > div:nth-child(5) > div > div.pull-left > div`);
    await fillInForm({page, data: fundraiserData.EditFundraiser, Selectors: Fundraiser.EditFundraiser});
    await page.click(General.CRUD.Publish);
    await page.waitForSelector(`${General.CRUD.Publish}[disabled]`, {hidden: true});

    // HACK: give ES a second to add event created above
    await page.waitFor(3000);
}, 45000);

test('Logged-out fundraiser donation', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    const fundId = await fundIdByName({fundName: eventData.name});
    await page.goto(`${APIBASE}#fundraiser/${fundId}`);
    await soGiveFailIfPointingAtProduction({page});

    await donate({page, Amount: {amount: 10}, GiftAid: {}, Details: {email: 'thePuppetMaster@winterwell.com'}, Message: {message:'???'}});
}, 30000);

test('Logged-in fundraiser donation', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    const fundId = await fundIdByName({fundName: eventData.name});
    await page.goto(`${APIBASE}#fundraiser/${fundId}`);
    await soGiveFailIfPointingAtProduction({page});

    await login({page, username, password});    
    await donate({page, Amount: {amount: 10}, GiftAid: {}, Details: {email: 'thePuppetMaster@winterwell.com'}, Message: {message:'???'}});
}, 30000);

test('Delete fundraiser', async() => {
    const page = await window.__BROWSER__.newPage();

    const fundId = await fundIdByName({fundName: eventData.name});
    await page.goto(`${APIBASE}#editFundraiser/${fundId}`);
    await soGiveFailIfPointingAtProduction({page});
    await login({page, username, password});

    await page.waitForSelector(General.CRUD.Delete);
    await page.click(General.CRUD.Delete);
}, 15000);

test('Delete event', async() => {
    const page = await window.__BROWSER__.newPage();

    await page.goto(`${APIBASE}#event`);
    await soGiveFailIfPointingAtProduction({page});

    await login({page, username, password});
    await deleteEvent({page, eventName: eventData.name});
}, 30000);

// Separated out deleting events. Was meaning that screenshot taken for above is completely useless
// test('Delete fundraiser and event', async() => {
//     const browser = window.__BROWSER__;
//     const page = await browser.newPage();
    
//     //Doesn't really matter which page it goes
//     await Event.goto({page});
//     await login({page, username, password}); 
    
//     await Fundraiser.deleteFundraiser({page, fundName:"You will be assimilated"});
//     await Event.deleteEvent({page, eventName: "You will be assimilated"}); 
// }, 15000);
