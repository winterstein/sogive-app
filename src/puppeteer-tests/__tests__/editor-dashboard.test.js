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
const charityId = "tbd";
const expectedEditorial = "tbd is an okay charity doing mediocre things\nso overall we think they are bronze"

// Published doc containing charityId (as a Header 2) followed by expectedEditorial
let editorialsUrl = 'https://docs.google.com/document/d/e/2PACX-1vTJ018R_FZ1_efPZKe17KhjPajEzm_folfOdSUUNtBDyBCK-URyOQ02K7K9TxsEotv5oSMUOdkZZV_m/pub';

// Increase default timeout to prevent occasional flaky failures.
// Note, this must be higher than any specific timeouts set within the tests below, otherwise they have no effect.
jest.setTimeout(30000);

beforeAll(async () => {
	await page.goto(`${url}#editordashboard`);
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
		await page.goto(`${url}#editordashboard`);
		// dismiss any leftover dialogs
		await page.evaluate(() => {
			document.querySelectorAll(".alert-warning > .close").forEach(el => el.click());
			document.querySelectorAll(".alert-danger > .close").forEach(el => el.click());
		});
		// wait for alert dialog to disappear
		// (decrease timeout so we fail-fast & get a better error message if it doesn't)
		await page.waitForSelector('.alert-danger', { hidden: true, timeout: 5000 });
	});

	afterEach(async () => {
		// dismiss any leftover dialogs
		await page.evaluate(() => {
			document.querySelectorAll(".alert-warning > .close").forEach(el => el.click());
			document.querySelectorAll(".alert-danger > .close").forEach(el => el.click());
		});
	});

	test('Import charity editorials from published gdoc', async () => {
		await page.type('[name=editorialsUrl]', editorialsUrl);
		await page.click('[name=importEditorials]');

		// give elastic search time to update
		await page.waitFor(1000);

		await(page.waitForSelector('div.alert'))
		const alertMessage = await page.$eval('div.alert', e => e.innerText);
		expect(alertMessage).toEqual(expect.stringContaining('Successfully imported editorials'));

		const editorialsUrlText = await page.$eval('[name=editorialsUrl]', e => e.value);
		expect (editorialsUrlText).toBe('');

		// navigate to charity page
		await page.goto(`${url}#charity?charityId=${charityId}`);

		// click on 'Analysis'
		await page.waitForSelector('#rhsTabs');
		await page.click('#rhsTabs .nav-item:not(.active) a.nav-link');

		const charityEditorial = await page.$$eval('.charity-extra .quote p', els => els.map(el => el.innerText).join('\n'));
		expect(charityEditorial).toEqual(expectedEditorial);
	});

	test('Show error alert for a malformed URL', async () => {
		await page.type('[name=editorialsUrl]', "malformedURLjckdsljkldjkls");

		await page.click('[name=importEditorials]');

		await(page.waitForSelector('div.alert-danger'))
		const alertMessage = await page.$eval('div.alert', e => e.innerText);
		expect(alertMessage).toEqual(expect.stringContaining('Malformed URL'));
	});
});
