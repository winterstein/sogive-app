const puppeteer = require('puppeteer');
const {login, eventIdFromName} = require('../test-base/res/UtilityFunctions');
const {username, password} = require('../test-base/credentials');
const Event = require('../sogive-scripts/event');
const Fundraiser = require('../sogive-scripts/fundraiser');
const Register = require('../sogive-scripts/register');

test('Create a fundraiser', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    await Event.goto({page});
    await login({page, username, password});  
    await Event.createNewEvent({
        page,
        event: {
            name: "You will be assimilated",
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
    await Register.goto({page, fundName:"You will be assimilated"});
    await Register.completeForm({
        page, 
        Charity: {charity:'puppet'},
        EditFundraiser: {
            name: "You will be assimilated",
            description: "I really hope so"
        }
    });
}, 45000);

//Seperated out deleting events. Was meaning that screenshot taken for above is completely useless
test('Delete fundraiser and event', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();
    
    //Doesn't really matter which page it goes
    await Event.goto({page});
    await login({page, username, password}); 
    
    await Fundraiser.deleteFundraiser({page, fundName:"You will be assimilated"});
    await Event.deleteEvent({page, eventName: "You will be assimilated"}); 
}, 15000);
