const puppeteer = require('puppeteer');
const Search = require('./sogive-scripts/sogive.org_search');
const Donation = require('./sogive-scripts/sogive.org_charity');
const {login, timeout} = require('./res/UtilityFunctions');

async function run(page) {
    await Search.goto(page);
    //Quite problematic if user has to remember to add script
    //everytime that goto() is used.
    //Could give each page a goto() method to be used instead.
    //easy to insert script from there
    // await login({
    //     page, 
    //     username: 'mark@winterwell.com', 
    //     //password: 'soGive1368'
    // });    
    await Search.search({
        page, 
        search_term: 'oxfam'
    });
    await Search.gotoResult({
        page, 
        selectorOrInteger: 1
    });
    await timeout(3000);//Possible to eliminate this? Issue is with image loading in late
    await Donation.donate({page, amount: 100});   
    await Donation.testSubmit({page});   
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
