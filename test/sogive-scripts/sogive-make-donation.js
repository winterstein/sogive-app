const puppeteer = require('puppeteer');
const Search = require('../sogive-scripts/sogive.org_search');
const Donation = require('../sogive-scripts/sogive.org_charity');

async function run(page) {
    await Search.goto(page);
    //Quite problematic if user has to remember to add script
    //everytime that goto() is used.
    //Could give each page a goto() method to be used instead.
    //easy to insert script from there
    await Search.search({
        page, 
        search_term: 'oxfam'
    });
    await Search.gotoResult({
        page, 
        selectorOrInteger: 1
    });
    await Donation.donate({page, amount: 100});  
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
