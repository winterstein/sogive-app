// checks functionality of sogive.org/#edit
const puppeteer = require('puppeteer');
const { login, soGiveFailIfPointingAtProduction, donate } = require("../utils/UtilityFunctions");
const { username, password } = require("../utils/Credentials");
const { CommonSelectors, Search, General } = require('../utils/SoGiveSelectors');
const $ = require('jquery');

const APIBASE = 'https://test.sogive.org';

// the lucky charity to be tested
const lamb = "urras-eaglais-na-h-aoidhe";
const timeStamp = new Date().toISOString();

const argvs = process.argv;
const devtools = argvs.join(',').includes('debug') || false;

let browser;
let page;

describe('Edit organisation tests', () => {

	beforeEach(async () => {
		browser = await puppeteer.launch({ headless: !devtools, devtools: devtools });
		page = await browser.newPage();
	});

	afterEach(async () => {
		await browser.close();
	});

	test('Edit and publish field', async () => {
		await page.goto(APIBASE);

		await page.$('.login-link');
		await page.click('.login-link');
        
		await page.click('[name=email]');
		await page.type('[name=email]', username);
		await page.click('[name=password]');
		await page.type('[name=password]', password);

		// await page.evaluate(() => { debugger; });

		await page.keyboard.press('Enter');

		await page.goto(`${APIBASE}#edit?charityId=${lamb}`);

		await page.waitForSelector('[name=summaryDescription]');
		await page.click('[name=summaryDescription]', { clickCount: 3 });
		await page.type('[name=summaryDescription]', timeStamp);
		await page.click(CommonSelectors.Publish);
		await page.goto(`${APIBASE}#charity?charityId=urras-eaglais-na-h-aoidhe`);

		await page.waitForSelector('.description-short');

		const profileShortDescription = await page.$eval('.donation-output p', e => e.innerText);
		await expect(profileShortDescription).toBe(timeStamp);
	}, 99999);

	// TODO: BUG: sogive editor does not save empty fields, so we'll replace it with a '.'
	// test('Reset edits', async () => {
	//     await page.goto(`${APIBASE}#edit?charityId=${lamb}`);
	//     await page.waitForSelector('[name=summaryDescription]');
	//     await page.click('[name=summaryDescription]', { clickCount: 3 });
	//     // await page.keyboard.press('Backspace');
	//     await page.type('[name=summaryDescription]', '.');
	//     await page.click('[name=save]');
	//     await page.waitFor(2000);
	//     await page.click('[name=publish]');
	//     await page.waitFor(2000);

	//     await page.goto(`${APIBASE}#charity?charityId=urras-eaglais-na-h-aoidhe`);
	//     await page.waitForSelector('.donation-output');

	//     const profileShortDescription = await page.$eval('.donation-output p', e => e.innerText);
	//     await expect(profileShortDescription).toBe('.'); 
	// }, 50000);
});
