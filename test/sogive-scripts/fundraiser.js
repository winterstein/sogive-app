const puppeteer = require('puppeteer');
const {
    fundIdByName,
    APIBASE
} = require('../test-base/res/UtilityFunctions');
const {donate} = require('./donation-form');
const {General, Fundraiser} = require('./Selectors');

async function goto({page, fundId, fundName}) {
    if(fundName) {
        const ID = await fundIdByName({page, fundName});
        await goto({page, fundId: ID});
    }
    else{
        page.goto(`${APIBASE}#fundraiser/${fundId || ''}`);  
        await page.waitForSelector('.loader-box');    
        await page.waitForSelector('.loader-box', {hidden: true}); 
    }
}

async function gotoEditFundraiser({page, fundId}) {
    await page.goto(`${APIBASE}#editFundraiser/${fundId}`);  
    await page.waitForSelector(General.CRUD.Delete);    
}

//Should change name to avoid confusion with other goto methods
//which always take the user to some other URL.
async function gotoResult({page, selectorOrInteger = 1}) {
    let fundraiser_selector = Fundraiser.Main.FundraiserList;

    if(Number.isInteger(selectorOrInteger)) fundraiser_selector += `> div:nth-child(${selectorOrInteger}) > a`;
    if(typeof selectorOrInteger === 'string') fundraiser_selector += `> div > a[href="#fundraiser/${selectorOrInteger}"]`;
    fundraiser_selector += ` a`;
    await page.click(fundraiser_selector);
}

async function deleteFundraiser({page, fundName, fundId}) {
    if(fundName) {
        const ID = await fundIdByName({page, fundName});
        await deleteFundraiser({page, fundId: ID});
    }
    else{
        await gotoEditFundraiser({page, fundId});
        await page.click(General.CRUD.Delete);
    }
}

module.exports = {
    deleteFundraiser,
    donate,
    goto,
    gotoResult
};
