const puppeteer = require('puppeteer');
const Search = require('./sogive-scripts/sogive.org_search');
const Donation = require('./sogive-scripts/sogive.org_charity');
const {timeout} = require('./res/UtilityFunctions');

async function run(page) {
    await Search.goto(page);
    await Search.search({page, search_term: 'oxfam'});
    await Search.gotoResult({page, selectorOrInteger: 1});
    //page .loaded didn't seem to work here.
    await timeout(3000);
    await Donation.donate({page});
}

//Still need to define conditions for success/failure
//Should report this back to test-manager
//Throw an error? Would work with try/catch block in parent.

//How are we going to define failure?
//More importantly, how are we going to make
//writing this criteria for every test easy?
//Feel that possible criteria are too diverse to make this something that just works;
//developer will have to decide and code this.

module.exports = {run};
