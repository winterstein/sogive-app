const puppeteer = require("puppeteer");
const { login, soGiveFailIfPointingAtProduction, donate } = require("../utils/UtilityFunctions");
const { username, password } = require("../utils/Credentials");
const { CommonSelectors, Search, General } = require('../utils/SoGiveSelectors');
const { targetServers } = require('../utils/testConfig');

const Details = {
	name: "Human Realman",
	email: "mark@winterwell.com",
	address: "123 Clown Shoes Avenue",
	postcode: "CS20AD",
	"consent-checkbox": true
};

const config = JSON.parse(process.env.__CONFIGURATION);

const baseSite = targetServers[config.site];
const protocol = config.site === 'local' ? 'http://' : 'https://';

let url = `${baseSite}`;

describe("Charity donation tests", () => {
	beforeEach(async () => {
		await page.goto(url);
	});

	test("Logged-out charity donation", async () => {
		// Search for charity
		await page.click(Search.Main.SearchField);
		await page.keyboard.type("oxfam");
		await page.click(Search.Main.SearchButton);

		// Click on first link in search results
		await page.waitForSelector(Search.Main.FirstResult);
		await page.click(Search.Main.FirstResult);

		await donate({
			page,
			Amount: {
				amount: 1
			},
			GiftAid: {},
			Details
		});
	}, 90000);

	test("Logged-in charity donation", async () => {
		await login({ page, username, password });

		// Search for charity
		await page.click(Search.Main.SearchField);
		await page.keyboard.type("oxfam");
		await page.click(Search.Main.SearchButton);

		// Click on first link in search results
		await page.waitForSelector(Search.Main.FirstResult);
		await page.click(Search.Main.FirstResult);
		await page.waitForSelector('.donate-button');
		await page.click('.donate-button');

		await donate({
			page,
			Amount: {
				amount: 1
			},
			GiftAid: {},
			Details
		});
	}, 90000);
});
