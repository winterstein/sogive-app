const puppeteer = require('puppeteer');
const fs = require('fs');
const {
    APIBASE,
    disableAnimations
} = require('../test-base/res/UtilityFunctions');
const {Search} = require("./Selectors");

//Need some kind of time-out functionality for these

//Page-specific actions likely to be used during testing
async function search({page, search_term}) {
    await page.click(Search.Main.SearchField);
    await page.keyboard.type(search_term);
    
    page.click(Search.Main.SearchButton);
    await page.waitForSelector('.loader-box');    
    await page.waitForSelector('.loader-box', {hidden: true}); 
}
/**Can specify result to click by either charityId or position in results list. 
 * NOTE: will throw an error if specified result is not found
*/
async function gotoResult({page, selectorOrInteger = 1}) {
    let result_selector = Search.Main.ResultsList;

    if(Number.isInteger(selectorOrInteger)) result_selector += ` div:nth-child(${selectorOrInteger})`;
    if(typeof selectorOrInteger === 'string') result_selector += ` ${selectorOrInteger}`;
    result_selector += ` a`;
    page.click(result_selector);
    
    await page.waitForSelector('.loader-box');    
    await page.waitForSelector('.loader-box', {hidden: true}); 
}

/**Loads page to which the current js file pertains  
 * Would be nice to find a better way of sharing the page object around. Bit of a pain in the arse
*/
async function goto(page) {
    await page.goto(APIBASE + '/#search?q=');  
    await page.waitForSelector(Search.Main.SearchField);
}

module.exports = {
    goto,
    search,
    gotoResult
};
