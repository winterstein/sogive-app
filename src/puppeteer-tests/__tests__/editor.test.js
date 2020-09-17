// checks functionality of sogive.org/#edit
const puppeteer = require('puppeteer');
const { doLogin,serverSafetyCheck } = require("../test-base/UtilityFunctions");
const { username, password } = require("../Credentials");
const { CommonSelectors, Search, General } = require('../SoGiveSelectors');
const { targetServers } = require('../testConfig');

const config = JSON.parse(process.env.__CONFIGURATION);

const baseSite = targetServers[config.site];
const protocol = config.site === 'local' ? 'http://' : 'https://';

let url = `${baseSite}`;

// the lucky charity to be tested
const charityId = "tbd";
const timeStamp = new Date().toISOString();

// Increase default timeout to prevent occasional flaky failures.
// Note, this must be higher than any specific timeouts set within the tests below, otherwise they have no effect.
jest.setTimeout(30000);

describe('Edit organisation tests', () => {
	
	serverSafetyCheck(page, url);

	test('Edit and publish field', async () => {
		// Increase from default (800*600) as workaround for issue where off-screen elements added to DOM after
		// page load cannot be scrolled into view (see https://github.com/puppeteer/puppeteer/issues/2190).
		await page.setViewport({
		  width: 1024,
		  height: 768,
		  deviceScaleFactor: 1,
		});
		await page.goto(`${url}#simpleedit?charityId=${charityId}`);

		// log in
		// TODO(anita): Replace this section with login() utility method used elsewhere.
		await page.click('.login-link');
		await page.click('[name=email]');
		await page.type('[name=email]', username);
		await page.click('[name=password]');
		await page.type('[name=password]', password);
		await page.keyboard.press('Enter');
		// wait for login dialog to disappear
		await page.waitForSelector('[name=email]', { hidden: true });

		// expand the charity profile section
		// decrease timeout so we fail-fast on this line if it isn't shown.
		await page.waitForSelector('[title="Charity Profile"]', { timeout: 5000 });
		await page.click('[title="Charity Profile"]');

		// clear any existing summary text
		await page.evaluate( () => document.querySelector('[name="summaryDescription"]').value = "");

		// type the current timestamp into the summary description
		await page.click('[name=summaryDescription]');
		await page.type('[name=summaryDescription]', timeStamp);

		await page.click(CommonSelectors.Publish);
		// give elastic search time to update (else this test fails the first time it is run)
		await page.waitFor(1000);

		await page.goto(`${url}#charity?charityId=${charityId}`);
		await page.waitForSelector('.description-short');

		const profileShortDescription = await page.$eval('.donation-output p', e => e.innerText);

		expect(profileShortDescription).toBe(timeStamp);
	});

});
