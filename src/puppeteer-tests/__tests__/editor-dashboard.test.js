// checks functionality of sogive.org/#editordashboard

const puppeteer = require('puppeteer');
const { doLogin,serverSafetyCheck } = require("../test-base/UtilityFunctions");
const { username, password } = require("../Credentials");
const { CommonSelectors, Search, General } = require('../SoGiveSelectors');
const { targetServers } = require('../testConfig');
const config = JSON.parse(process.env.__CONFIGURATION);

const  sogiveUrl = `${targetServers[config.site]}`;

// ID of a charity that is assumed to always be in the database prior to these tests running.
const idOfCharityInDb = "tbd";
const expectedEditorial = "tbd is an okay charity doing mediocre things\nso overall we think they are bronze"

// Published doc containing {idOfCharityInDb} followed by {expectedEditorial}, in correct format
const publishedUrlWithCharityInDbEditorial = 'https://docs.google.com/document/d/e/2PACX-1vTJ018R_FZ1_efPZKe17KhjPajEzm_folfOdSUUNtBDyBCK-URyOQ02K7K9TxsEotv5oSMUOdkZZV_m/pub';

// Published doc containing editorials for unknown charities (not in the database)
const publishedUrlWithUnrecognisedCharities = 'https://docs.google.com/document/d/e/2PACX-1vRk52OOb1-yS3hejnqdeGfjT6m5wIXBYcjVGqaxDwYcpJZVVeefR6IpED8tMb09O_9PIE-c0YFkhpBR/pub';

// Increase default timeout to prevent occasional flaky failures.
// Note, this must be higher than any specific timeouts set within the tests below, otherwise they have no effect.
jest.setTimeout(30000);

beforeAll(async () => {
	await page.goto(`${sogiveUrl}#editordashboard`);
	// log in
	await page.click('.login-link');
	await page.click('.login-email [name=email]');
	await page.type('.login-email [name=email]', username);
	await page.click('[name=password]');
	await page.type('[name=password]', password);
	await page.keyboard.press('Enter');

	// wait for login dialog to disappear
	// (decrease timeout so we fail-fast & get a better error message if it doesn't)
	await page.waitForSelector('.login-email [name=email]', { hidden: true, timeout: 5000 });
  });

describe('Editor dashboard tests', () => {
	beforeEach(async () => {
		await page.goto(`${sogiveUrl}#editordashboard`);
		// wait for any user notifications to disappear
		// (decrease timeout so we fail-fast & get a better error message if they don't)
		await page.waitForSelector('.MessageBar .alert', { hidden: true, timeout: 1000 });
	});

	afterEach(async () => {
		// dismiss any leftover notifications
		await page.evaluate(() => {
			document.querySelectorAll(".MessageBar .alert-warning > .close").forEach(el => el.click());
			document.querySelectorAll(".MessageBar .alert-danger > .close").forEach(el => el.click());
		});
	});

	test('Import editorial for charity in the database', async () => {
		await page.type('[name=editorialsUrl]', publishedUrlWithCharityInDbEditorial);
		await page.click('[name=importEditorials]');

		// give elastic search time to update
		await page.waitFor(1000);

		await(page.waitForSelector('div.alert'))
		const alertMessage = await page.$eval('div.alert', e => e.innerText);
		expect(alertMessage).toEqual(expect.stringContaining('Successfully imported 1 editorials'));

		const editorialsUrlText = await page.$eval('[name=editorialsUrl]', e => e.value);
		expect (editorialsUrlText).toBe('');

		// navigate to charity page
		await page.goto(`${sogiveUrl}#charity?charityId=${idOfCharityInDb}`);

		// click on 'Analysis'
		await page.waitForSelector('#rhsTabs');
		await page.click('#rhsTabs .nav-item:not(.active) a.nav-link');

		const charityEditorial = await page.$$eval('.charity-extra .quote p', els => els.map(el => el.innerText).join('\n'));
		expect(charityEditorial).toEqual(expectedEditorial);
	});

	test('Show error notification for a malformed URL', async () => {
		await page.type('[name=editorialsUrl]', "foobarjckdsljkldjkls");

		await page.click('[name=importEditorials]');

		await(page.waitForSelector('.MessageBar div.alert-danger'))
		const alertMessage = await page.$eval('.MessageBar div.alert', e => e.innerText);
		expect(alertMessage).toEqual(expect.stringContaining('Malformed URL'));
	});

	test('Do not import editorials for charities not in the database', async () => {
		await page.type('[name=editorialsUrl]', publishedUrlWithUnrecognisedCharities);
		await page.click('[name=importEditorials]');

		// give elastic search time to update
		await page.waitFor(1000);

		await(page.waitForSelector('.MessageBar div.alert'))
		const alertMessage = await page.$eval('.MessageBar div.alert', e => e.innerText);
		expect(alertMessage).toEqual(expect.stringContaining('Successfully imported 0 editorials'));

		// TODO: Test we notify the user which charity editorials were rejected.
	});

});
