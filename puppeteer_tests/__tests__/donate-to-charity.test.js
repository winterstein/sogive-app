const puppeteer = require("puppeteer");
const { login, soGiveFailIfPointingAtProduction, donate } = require("../utils/UtilityFunctions");
const { username, password } = require("../utils/Credentials");
const { CommonSelectors, Search, General } = require('../utils/SoGiveSelectors');

const Details = {
	name: "Human Realman",
	email: "mark@winterwell.com",
	address: "123 Clown Shoes Avenue",
	postcode: "CS20AD",
	"consent-checkbox": true
};

const APIBASE = 'https://test.sogive.org';
const argvs = process.argv;
const devtools = argvs.join(',').includes('debug') || false;

let browser;
let page;

describe("Charity donation tests", () => {
	beforeEach(async () => {
		browser = await puppeteer.launch({ headless: false, devtools: devtools });
		page = await browser.newPage();
	});

	afterEach(async () => {
		await browser.close();
	});

	test("Logged-out charity donation", async () => {
		await page.goto(APIBASE + "#search?q=");

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
		await page.goto(APIBASE + "#search?q=");
		await login({ page, username, password });

		// Search for charity
		await page.click(Search.Main.SearchField);
		await page.keyboard.type("oxfam");
		await page.click(Search.Main.SearchButton);

		// Click on first link in search results
		// await page.waitForSelector(Search.Main.FirstResult);
		// await page.click(Search.Main.FirstResult);
		await page.waitForSelector('#search > div > div:nth-child(2) > div > div.results-list > div:nth-child(2) > a.logo.col-md-2.col-xs-4');
		await page.click('#search > div > div:nth-child(2) > div > div.results-list > div:nth-child(2) > a.logo.col-md-2.col-xs-4');

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
