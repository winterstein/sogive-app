const puppeteer = require('puppeteer');

//CSS selectors for important elements on page
//Concerned that these are too susceptible to changes in DOM structure
//Could potentially add fixed classes/ids to elements in future to make tests more reliable
const SEARCH_FIELD = `#formq`;
const SEARCH_BUTTON = `span.sogive-search-box.input-group-addon`;
const RESULTS_LIST = `#search div.results-list`;

//Need some kind of time-out functionality for these

//Page-specific actions likely to be used during testing
async function search(args) {
    const {page, search_term} = args;

    await page.click(SEARCH_FIELD);
    await page.keyboard.type(search_term);
    await page.click(SEARCH_BUTTON);
}
/**Can specify result to click by either charityId or position in results list. 
 * NOTE: will throw an error if specified result is not found
*/
async function gotoResult(args) {
    const {page} = args;
    const {selectorOrInteger} = args || 1; //Attempts to retrieve first result by default
    let result_selector = RESULTS_LIST;

    if(Number.isInteger(selectorOrInteger)) result_selector += ` div:nth-child(${selectorOrInteger})`;
    if(typeof selectorOrInteger === 'string') result_selector += ` ${selectorOrInteger}`;
    result_selector += ` a`;

    await page.click(result_selector);
}

/**Loads page to which the current js file pertains  
 * Would be nice to find a better way of sharing the page object around. Bit of a pain in the arse
*/
async function goto(page) {
    await page.goto('http://test.sogive.org/#search?q=');
}

module.exports = {
    goto,
    search,
    gotoResult
};
