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
jest.setTimeout(10000);

beforeAll(async () => {
	await page.goto(`${sogiveUrl}#editordashboard`);
	// log in
	await page.click('.login-link a');
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

		await(page.waitForSelector('.MessageBar div.alert-warning', { timeout: 3000 }))
		const alertMessage = await page.$eval('.MessageBar div.alert-warning', e => e.innerText);
		expect(alertMessage).toEqual(expect.stringContaining('Successfully imported 1 editorials'));

		const editorialsUrlText = await page.$eval('[name=editorialsUrl]', e => e.value);
		expect (editorialsUrlText).toBe('');

		// navigate to charity page
		await page.goto(`${sogiveUrl}#charity?charityId=${idOfCharityInDb}`);

		await(page.waitForSelector('.div-section-text p', { timeout: 3000 }));
		const charityEditorial = await page.$$eval('.div-section-text p', els => els.map(el => el.innerText).join('\n'));
		expect(charityEditorial).toMatch(expectedEditorial);
	});

	test('Show error notification for a malformed URL', async () => {
		await page.type('[name=editorialsUrl]', "2PACX-1vRk52OOb1-yS3hejnqdeGfjT6m5wIXBYcjVGqaxDwYcpJZVVeefR6IpED8tMb09O_9PIE-c0YFkhpBR/pub");

		await page.click('[name=importEditorials]');

		await(page.waitForSelector('.MessageBar div.alert-danger', { timeout: 3000 }))
		const alertMessage = await page.$eval('.MessageBar div.alert-danger', e => e.innerText);
		expect(alertMessage).toEqual(expect.stringContaining('Malformed URL'));
	});

	test('Show error notification for URL not ending in /pub', async () => {
		await page.type('[name=editorialsUrl]', "https://docs.google.com/document/d/1A4dPVA2SxgynQa7DrRJi59pC0DxGxiFS0q9M2fVcDxI/edit");

		await page.click('[name=importEditorials]');

		await(page.waitForSelector('.MessageBar div.alert-danger', { timeout: 3000 }))
		const alertMessage = await page.$eval('.MessageBar div.alert-danger', e => e.innerText);
		expect(alertMessage).toEqual(expect.stringContaining('Link given *must* end in /pub'));
	});

	test('Do not import editorials for charities not in the database', async () => {
		await page.type('[name=editorialsUrl]', publishedUrlWithUnrecognisedCharities);
		await page.click('[name=importEditorials]');

		await page.waitForSelector('.MessageBar div.alert-danger', { timeout: 3000 });
		const alertDanger = await page.$eval('.MessageBar div.alert-danger', e => e.innerText);
		expect(alertDanger).toEqual(expect.stringContaining('Rejected 2 charities not in database:'));
		expect(alertDanger).toEqual(expect.stringContaining('unknown-charity'));
		expect(alertDanger).toEqual(expect.stringContaining('yet-another-unknown-charity'));
	});

	test('Do not show dashboard when logged out', async () => {
		// Log out
		await page.click('.navbar .dropdown-toggle');
		await page.click('.logout-link');
		await page.waitForSelector('.login-link');

		// Logging out takes you back to the homepage, so navigate back to the dashboard
		await page.goto(`${sogiveUrl}#editordashboard`);

		await expect(page).not.toMatchElement('.EditorDashboardPage');
		await expect(page).not.toMatchElement('[name=importEditorials]');
		await expect(page).toMatch('Log in');
	});

});
