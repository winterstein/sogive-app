// checks functionality of sogive.org/#edit
const puppeteer = require('puppeteer');
const { doLogin } = require("../test-base/UtilityFunctions");
const { username, password } = require("../Credentials");
const { CommonSelectors, Search, General } = require('../SoGiveSelectors');
const { targetServers } = require('../testConfig');

const config = JSON.parse(process.env.__CONFIGURATION);

const baseSite = targetServers[config.site];
const protocol = config.site === 'local' ? 'http://' : 'https://';

let url = `${baseSite}`;

// the lucky charity to be tested
const lamb = "urras-eaglais-na-h-aoidhe";
const timeStamp = new Date().toISOString();

describe('!!broken Edit charity tests', () => {

	// nobbled TODO fix
	test("!! tests OFF", async () => {
	});
	if (true) return;

	test('Edit and publish field', async () => {
		await page.goto(url);
		await doLogin({page});

		await page.goto(`${url}#edit?charityId=${lamb}`);

		await page.waitForSelector('[name=summaryDescription]');
		await page.click('[name=summaryDescription]', { clickCount: 3 });
		await page.type('[name=summaryDescription]', timeStamp);
		await page.click(CommonSelectors.Publish);
		await page.goto(`${url}#charity?charityId=urras-eaglais-na-h-aoidhe`);

		await page.waitForSelector('.description-short');

		const profileShortDescription = await page.$eval('.donation-output p', e => e.innerText);
		await expect(profileShortDescription).toBe(timeStamp);
	}, 99999);

});
