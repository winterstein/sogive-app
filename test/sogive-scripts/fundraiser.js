const puppeteer = require('puppeteer');
const {
    disableAnimations,
    APIBASE
} = require('../test-base/res/UtilityFunctions');
const {donate} = require('./donation-form');
const {Fundraiser} = require('./Selectors');

async function goto({page, fundId}) {
    page.goto(`${APIBASE}#fundraiser/${fundId || ''}`);  
    await page.waitForSelector('.loader-box');    
    await page.waitForSelector('.loader-box', {hidden: true}); 
}

async function gotoResult({page, selectorOrInteger = 1}) {
    let fundraiser_selector = Fundraiser.Main.FundraiserList;

    if(Number.isInteger(selectorOrInteger)) fundraiser_selector += `> div:nth-child(${selectorOrInteger}) > a`;
    if(typeof selectorOrInteger === 'string') fundraiser_selector += `> div > a[href="#fundraiser/${selectorOrInteger}"]`;
    fundraiser_selector += ` a`;
    console.log(fundraiser_selector);
    await page.click(fundraiser_selector);
}

module.exports = {
    donate,
    goto,
    gotoResult
};
