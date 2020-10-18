const puppeteer = require("puppeteer");
const { doLogin, donate, fillInForm } = require("../test-base/UtilityFunctions");
const { username, password } = require("../Credentials");
const { CommonSelectors, Search, General, Register, Fundraiser } = require('../SoGiveSelectors');
const { targetServers } = require('../testConfig');


const config = JSON.parse(process.env.__CONFIGURATION);

const baseSite = targetServers[config.site];
const protocol = config.site === 'local' ? 'http://' : 'https://';

let url = `${baseSite}`;

// Default event data
const eventData = {
	name: Date.now(),
	description: "Resistance is futile",
	"web-page": "https://developers.google.com/web/tools/puppeteer/",
	"matched-funding": 10,
	sponsor: "Locutus of Borg",

	backdrop:
		"https://i.pinimg.com/originals/a4/42/b9/a442b9891265ec69c78187a030b0753b.jpg",

	ticketName: "Assimile",
	stock: 1000,
	price: 0
};

const fundraiserData = {
	payment: {},
	EditFundraiser: {
		name: eventData.name,
		description: "I really hope so"
	}
};

// Use existing event to test fundraiser. We test event creation separately.
const eventId = 'VgT2FGzo';
let fundraiserEditLink; // Link to fundraiser edit page, from where we delete it.
let fundraiserId;

const fundraiserIdClip = () => {
	return fundraiserEditLink.split('/').pop();
};

describe("!!broken Fundraiser tests", () => {

	// nobbled TODO fix
	test("!! tests OFF", async () => {
	});
	if (true) return;

	test("Create a fundraiser", async () => {
		await page.goto(`${url}#event`);

		// login.
		await doLogin({ page, username, password });

		// Go to event page and click on Register event
		await page.goto(url + `#event/${eventId}`);
		await page.waitForSelector('.btn');
		await page.click('.btn');

		// Emtpy the basket and add a ticket
		await page.waitForSelector(Register.EmptyBasket);
		await page.click(Register.EmptyBasket);

		await page.waitFor(3000);
		await page.waitForSelector('.add-first-ticket');
		await page.click('.add-first-ticket');

		await page.waitFor(1000);
		await page.waitForSelector(Register.Next);
		await page.click(Register.Next);
		// Will fail if user is not already logged in
		await page.waitForSelector(Register.Next);
		await page.click(Register.Next);

		await page.waitFor(1500);
		await page.waitForSelector(Register.Next);
		await page.click(Register.Next);

		await page.waitForSelector('[name=charityId]');
		await page.type('[name=charityId]', 'oxfam');
		await page.waitFor(3000);

		await page.waitForSelector(Register.Next);
		await page.click(Register.Next);

		//Checkout
		//Special case to deal with button being different where event ticket price is set to £0
		if ((await page.$(Register.FreeTicketSubmit)) !== null) {
			await page.click(Register.FreeTicketSubmit);
		} else {
			await fillInForm({
				page,
				data: fundraiserData.payment,
				Selectors: General.ImpactCalculator
			});
			await page.click(Register.TestSubmit);
		}

		// Setting up the actual fundraiser
		await page.waitForSelector(Register.SetupFundraiser);
		await page.click(Register.SetupFundraiser);
		await page.waitForSelector(
			`#editFundraiser > div > div.padded-block > div:nth-child(5) > div > div.pull-left > div`
		);
		fundraiserEditLink = await page.url();
		fundraiserId = await fundraiserIdClip();
		await fillInForm({
			page,
			data: fundraiserData.EditFundraiser,
			Selectors: Fundraiser.EditFundraiser
		});
		await page.click(General.CRUD.Publish);
		await page.waitForSelector(`${General.CRUD.Publish}[disabled]`, {
			hidden: true
		});

		// HACK: give ES a second to add event created above
		await page.waitFor(3000);
	}, 45000);

	test("Logged-in fundraiser donation", async () => {
		await page.goto(`${url}#fundraiser/${fundraiserId}`);
		await page.reload();

		await doLogin({ page, username, password });

		// Click on Donate button
		await page.waitForSelector('.btn');
		await page.click('.btn');

		// Pick one time donation, select amount and move on
		await page.waitForSelector('[name=amount]');
		await page.click('[value=OFF]');
		await page.type('[name=amount]', '10');
		await page.waitFor(5000);
		await page.click('.btn.btn-primary.btn-lg.pull-right');
		await page.waitFor(2000);

		// Click 'yes' on all radio options
		const radioButtons = await page.$$eval('[type=radio]', radios => {
			radios.map(radio => {
				if (radio.value==='yes') radio.click();
			});
		});

		await page.waitFor(2000);
		await page.click('.pull-right');

		await page.waitForSelector('[name=donorEmail]');
		await page.type('[name=donorEmail]', 'test@email.fake');
		await page.click('.pull-right');

		await page.waitForSelector('[name=message]');
		await page.type('[name=message]', 'Test message!');
		await page.click('.pull-right');

		// Click on the donation simulation button
		await page.waitForSelector('small button');
		await page.click('small button');

		// If donations succesfull we should have a thank you message displayed.
		await page.waitForSelector('.text-center > h3');
		const thankYouMessage = await page.$eval('.text-center > h3', e => e.innerText);
		await expect(thankYouMessage).toBe('Thank You!');
	}, 30000);

	test("Logged-out fundraiser donation", async () => {
		// await page.goto(`${url}#fundraiser/aundiks.TurHe2nW.01ff18`);
		await page.goto(url);

		// Log out
		// await page.waitForSelector('#top-right-menu');
		// await page.click('#top-right-menu');
		// await page.waitForSelector('#top-right-menu > li > ul > li:nth-child(3) > a');
		// await page.click('#top-right-menu > li > ul > li:nth-child(3) > a');
		// await page.reload();

		await page.goto(`${url}#fundraiser/${fundraiserId}`);

		// Wait for donate button
		await page.waitForSelector('.btn');
		await page.click('.btn');

		// Pick one time donation, select amount and move on
		await page.waitForSelector('[name=amount]');
		await page.click('[value=OFF]');
		await page.type('[name=amount]', '10');
		await page.click('.btn.btn-primary.btn-lg.pull-right');
		await page.waitFor(2000);

		// Click 'yes' on all radio options
		const radioButtons = await page.$$eval('[type=radio]', radios => {
			radios.map(radio => {
				if (radio.value==='yes') return radio.click();
			});
		});

		// Onwards!
		await page.waitFor(2000);
		await page.click('.pull-right');

		await page.waitForSelector('[name=donorEmail]');
		await page.type('[name=donorEmail]', 'test@email.fake');
		await page.click('.pull-right');

		await page.waitForSelector('[name=message]');
		await page.type('[name=message]', 'Test message!');
		await page.click('.pull-right');

		// Click on the donation simulation button
		await page.waitForSelector('small button');
		await page.click('small button');

		// If donations succesfull we should have a thank you message displayed.
		await page.waitForSelector('.text-center > h3');
		const thankYouMessage = await page.$eval('.text-center > h3', e => e.innerText);
		await expect(thankYouMessage).toBe('Thank You!');
	}, 30000);

	test("Delete fundraiser", async () => {
		await page.goto(url);
		
		await doLogin({ page, username, password });
		await page.goto(fundraiserEditLink);

		await page.waitForSelector(General.CRUD.Delete);
		await page.click(General.CRUD.Delete);
	}, 99000);
});
