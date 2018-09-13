const puppeteer = require('puppeteer');
const {login, eventIdFromName} = require('../test-base/res/UtilityFunctions');
const {username, password} = require('../../../logins/sogive-app/puppeteer.credentials');
const Event = require('../sogive-scripts/event');
const Fundraiser = require('../sogive-scripts/fundraiser');
const Register = require('../sogive-scripts/register');

const fundName = new Date().toISOString();//"You will be assimilated";

test('Create a fundraiser', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    await Event.goto({page});
    await login({page, username, password});  
    await Event.createNewEvent({
        page,
        event: {
            name: fundName,
            description: "Resistance is futile",
            "web-page": 'https://developers.google.com/web/tools/puppeteer/',
            "matched-funding": 10,
            sponsor: "Locutus of Borg"
        },
        image: {
            backdrop: 'https://i.pinimg.com/originals/a4/42/b9/a442b9891265ec69c78187a030b0753b.jpg'
        },
        ticket: {
            name: "Assimile",
            stock: 1000,
            "invite-only-checkbox": true,
            "attendee-noun": "Inferior, carbon-based, lifeform",
            "attendee-icon": 'https://h5p.org/sites/default/files/h5p/content/10583/images/file-56f540bfae28b.jpg'
        }
    });    
    await page.waitFor(3000);//DELETE ME: Hack to deal with elastic search needing a second to register the event (15/06)
    await Register.goto({page, fundName});
    await Register.completeForm({
        page, 
        Charity: {
            charity: "puppet",
        },
        EditFundraiser: {
            name: fundName,
            description: "I really hope so"
        }
    });
}, 45000);

test('Logged-out fundraiser donation', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    // HACK: give ES a second to add event created above
    await page.waitFor(3000);

    await Fundraiser.goto({page, fundName});
    await Fundraiser.donate({page, Amount: {amount: 10}, GiftAid: {}, Details: {email: 'thePuppetMaster@winterwell.com'}, Message: {message:'???'}});
}, 25000);

test('Logged-in fundraiser donation', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    await Fundraiser.goto({page, fundName});
    await login({page, username, password});    
    await Fundraiser.donate({page, Amount: {amount: 10}, GiftAid: {}, Message: {message:'???'}});
}, 25000);

test('Delete fundraiser', async() => {
    const page = await window.__BROWSER__.newPage();

    await Fundraiser.goto({page, fundName});
    await login({page, username, password});
    await Fundraiser.deleteFundraiser({page, fundName});
}, 15000);

test('Delete event', async() => {
    const page = await window.__BROWSER__.newPage();

    await Event.goto({page});
    await login({page, username, password});
    await Event.deleteEvent({page, eventName: fundName});
}, 15000);

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
