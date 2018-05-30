const puppeteer = require('puppeteer');
const $ = require('jquery');
const {APIBASE, login} = require('../test-base/res/UtilityFunctions');
const {username, password} = require('../../../logins/sogive-app/puppeteer.credentials');
const Fundraiser = require('../sogive-scripts/fundraiser');

//Want to create an additional test that checks to see if the donation total has been correctly incremented
//Could do this either by scraping from page, or reading directly from JSON. Will be testing two seperate things:
//perfectly possible for the total displayed to be screwey while the JSON data is perfectly fine.

//Can check both front-end (value displayed) and back-end (value retrieved from JSON endpoint). If both are okay, can say that test passes. 

//These tests may end up being a touch unreliable. What happens if more donations are made between checking for total at start and at end?
//Test would see that they don't match and complain.
//Could simply check that total is larger at end that at start? Otherwise would need list of all donations made and their amounts.
//This might be possible. Perhaps goes a bit beyond this little proof-of-concept though
test('Check that total changes after donation is made', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();
    const fundId = 'mark.Piz7VKuA.541930';

    const initialTotal = await retrieveTotal({fundId});
    //Need to check total here
    await Fundraiser.goto({page, fundId: 'mark.Piz7VKuA.541930'});
    await Fundraiser.donate({page, Message: {message:''}, Payment: {tip: 3.50, "include-tip-checkbox": false}});

    //Check total again here.
    //if total !== initialTotal + amount, you fucked up.
    //Should only really have to check the value at the JSON end-point, but it does occasionaly happen that they don't match
    expect(await retrieveTotal({fundId})).toBeGreaterThan(initialTotal);

}, 45000);

async function retrieveTotal({fundId}) {
    const r = await $.ajax({
        url: `${APIBASE}fundraiser/${fundId}.json`,
        withCredentials: true,
        jwt: 'eyJraWQiOiJ1b2J4b3UxNjJjZWVkZTJlMSIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJzb2dpdmUiLCJqdGkiOiJTX0o1UE5rNHpGT0YtVGlrSVdJcDJBIiwiaWF0IjoxNTI3MjQ5NzkwLCJkdmNzaWciOm51bGwsInN1YiI6Im1hcmtAd2ludGVyd2VsbC5jb21AZW1haWwifQ.kmdCG5Xh2YypPLmtD_FP4Gc27cbpOd2Dx1LCOlBJNWqphBN-WQa7I6v-LmhwTbdheb8t7xE10xXtrsp9mObQ8QKsGU6Emdnyp9-eKrUTQFMf5HqwD-qpsiYEjw9SWTSaQkTOP4ieCbE61QL2-_3TN8hq4AAxYmjgJG0IUKUkN5jtozXCFYddqmpEXR4teRr7P470RDEAOqleddIJqd0KCId2ohGCe5CqMDFfcCLoaW-ICghQUAx9wlUDCmEN0I9BxErDp9WJ7spqji0MeanEurLlbAU47q5SyVQS70zAUJS3OhqFK_LHmFVETEQhb5nMpik3hSZJpS5x_YT56causg',
        status: 'PUBLISHED'
    });
    return r.cargo && r.cargo.donated && r.cargo.donated.value ? Number(r.cargo.donated.value) : null; 
}
