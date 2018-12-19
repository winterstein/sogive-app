const puppeteer = require('puppeteer');
const $ = require('jquery');
const fs = require('fs');
const {APIBASE, login, fundIdByName, disableAnimations} = require('../test-base/res/UtilityFunctions');
const {username, password} = require('../../../logins/sogive-app/puppeteer.credentials');
const Event = require('../sogive-scripts/event');
const Fundraiser = require('../sogive-scripts/fundraiser');
const Register = require('../sogive-scripts/register');

//Want to create an additional test that checks to see if the donation total has been correctly incremented
//Could do this either by scraping from page, or reading directly from JSON. Will be testing two seperate things:
//perfectly possible for the total displayed to be screwey while the JSON data is perfectly fine.

//Can check both front-end (value displayed) and back-end (value retrieved from JSON endpoint). If both are okay, can say that test passes. 

//These tests may end up being a touch unreliable. What happens if more donations are made between checking for total at start and at end?
//Test would see that they don't match and complain.
//Could simply check that total is larger at end that at start? Otherwise would need list of all donations made and their amounts.
//This might be possible. Perhaps goes a bit beyond this little proof-of-concept though
//A simpler solution would actually be to create a brand new fundraiser for this action. Highly unlikely that anyone else would donate to it during its brief existence
let page;
const fundName = new Date().toISOString();
const amount = 7.50;
const tip = 3.50;

test('Check that total changes after donation is made', async() => {
    const browser = window.__BROWSER__;
    page = await browser.newPage();
    page.waitForSelctor = async (s) => {
        fs.appendFileSync('investigation.txt', s);
        if($(s)) return;
        page.waitForSelctor(s);
    };
    //Create an event
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
    //Create a fundraiser
    await Register.goto({page, fundName});
    await Register.completeForm({
        page, 
        Charity: {
            charity:"puppet",
        },
        EditFundraiser: {
            name: fundName,
            description: "I really hope so",
        },
    });
    //Retrieve fundraiser ID
    const fundId = await fundIdByName({page, fundName});
    //Donate to fundraiser
    Fundraiser.goto({page, fundId});
    await Fundraiser.donate({page, Amount: {amount}, Message: {message:''}, Payment: {tip, "include-tip-checkbox": false}});

    expect(await retrieveTotal({fundId})).toEqual(amount + tip);
}, 60000);

// test('Investigating issue with waitForSelector', async () => {
//     const browser = window.__BROWSER__;
//     const pageI = await browser.newPage();

//     await pageI.goto('https://google.com');
//     await pageI.addScriptTag(disableAnimations);
//     await pageI.click(`#gbwa > div.gb_Sc > a`);
//     await pageI.waitForSelector('#gb23 > span.gb_2', {hidden: false});
//     await pageI.click('#gb23 > span.gb_2');
// }, 15000);
// afterEach(async () => {
//     const browser = window.__BROWSER__;
//     const pages = await browser.pages();    
//     const pageI = pages[1];
//     const html = '\n' + await pageI.evaluate(() => document.body.innerHTML);
//     fs.appendFileSync('investigation.txt', html);

//     await Fundraiser.deleteFundraiser({page, fundName});
//     await Event.deleteEvent({page, eventName: fundName}); 
// });


// Don't want test to fail if something goes wrong with these
afterEach(async () => {
    await Fundraiser.deleteFundraiser({page, fundName});
    await Event.deleteEvent({page, eventName: fundName}); 
});

async function retrieveTotal({fundId}) {
    const r = await $.ajax({
        url: `${APIBASE}fundraiser/${fundId}.json`,
        withCredentials: true,
        jwt: 'eyJraWQiOiJ1b2J4b3UxNjJjZWVkZTJlMSIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJzb2dpdmUiLCJqdGkiOiJTX0o1UE5rNHpGT0YtVGlrSVdJcDJBIiwiaWF0IjoxNTI3MjQ5NzkwLCJkdmNzaWciOm51bGwsInN1YiI6Im1hcmtAd2ludGVyd2VsbC5jb21AZW1haWwifQ.kmdCG5Xh2YypPLmtD_FP4Gc27cbpOd2Dx1LCOlBJNWqphBN-WQa7I6v-LmhwTbdheb8t7xE10xXtrsp9mObQ8QKsGU6Emdnyp9-eKrUTQFMf5HqwD-qpsiYEjw9SWTSaQkTOP4ieCbE61QL2-_3TN8hq4AAxYmjgJG0IUKUkN5jtozXCFYddqmpEXR4teRr7P470RDEAOqleddIJqd0KCId2ohGCe5CqMDFfcCLoaW-ICghQUAx9wlUDCmEN0I9BxErDp9WJ7spqji0MeanEurLlbAU47q5SyVQS70zAUJS3OhqFK_LHmFVETEQhb5nMpik3hSZJpS5x_YT56causg',
        status: 'PUBLISHED'
    });
    return r.cargo && r.cargo.donated && r.cargo.donated.value ? Number(r.cargo.donated.value) : null; 
}
