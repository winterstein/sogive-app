const puppeteer = require('puppeteer');
const Search = require('./sogive-scripts/sogive.org_search');
const Donation = require('./sogive-scripts/sogive.org_charity');
const {timeout} = require('./res/UtilityFunctions');

async function run(page) {
    try {
        await Search.goto(page);
        await Search.search({page, search_term: 'oxfam'});
        await Search.gotoResult({page, selectorOrInteger: 1});
        //page .loaded didn't seem to work here.
        await timeout(5000);
        await Donation.donate({page});
    }
    catch(e) { 
        //Report failure to test-manager
        return {
            success: false,
            error: e,
        };
    }
}

//Still need to define conditions for success/failure
//Should report this back to test-manager

module.exports = {run};
