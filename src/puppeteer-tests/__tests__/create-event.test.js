const puppeteer = require("puppeteer");
const { username, password } = require("../Credentials");
const { targetServers } = require('../testConfig');
const {doLogin} = require('../test-base/UtilityFunctions');
const config = JSON.parse(process.env.__CONFIGURATION);

const baseSite = targetServers[config.site];

let url = `${baseSite}`;

// Default event data
const eventData = {
	name: Date.now(),
	description: "Resistance is futile",
	"web-page": "https://developers.google.com/web/tools/puppeteer/",
	"matched-funding": 10,
	sponsor: "Locutus of Borg",
	backdrop:
		"https://i.pinimg.com/originals/a4/42/b9/a442b9891265ec69c78187a030b0753b.jpg"
};

describe("Create-Event-Tests", () => {
	const longName = "supercalifragilisticexpialidocious";
	let id = '';

	// Journey: User visits site, clicks on log in, types in their credentials, press Enter.
	// Result: They are now logged in
	test('Login to the site', async () => {
		await page.goto(url);
		await doLogin({page});
		// all good
	}, 99999);

	// Jorney: User goes to 'Event' tab. Clicks on create event, fills in some fields when prompted, publishes the changes.
	// Result: New event is published and listed
	test("Create an event", async () => {
		// console.log("Create an event...");
		await page.goto(url);

		await page.goto(url+'#event');

		// Clicks on the create button. 
		await page.waitForSelector('.btn-create');
		await page.click('.btn-create');

		// Wait for form to render, then fill it
		await page.waitForSelector("[name=name]");
		await page.click("[name=name]");
		await page.type("[name=name", longName);

		// Double check props are working correctly
		const nameText = await page.$eval("[name=name]", e => e.value);
		await expect(nameText).toBe(longName);

		await page.select('[name=country', 'GB');

		await page.waitForSelector("[name=publish]");
		await page.click('[name=publish]');

		// Grab and save the id. We'll use it later to see if event has been created.
		const idString = await page.$eval('#editEvent small', e => {
			return e.innerHTML.split(': ')[1];
		});

		id = idString;
		// check it saved
		await page.waitFor(2000);
		expect(page).toMatch("Status: PUBLISHED");
		// console.log("...Create an event: "+id);
	}, 45000);

	// Journey: User goes to specific event (the test one made above), clicks on 'Delete'
	// Shortcut: jump to the editEvent page
	// Result: Event deleted and removed from the list.
	test('Delete event created', async() => {
		// console.log("Delete event created...");
		if ( ! id) throw new Error("No id from Create an event?!");
		// Go to the event
		// console.log("goto "+url+`#editEvent/${id}`);
		await page.goto(url+`#editEvent/${id}`);

		// Wait for 'Delete' button to render
		await page.waitForSelector('[name=delete]');
		// Delete!
		await page.click('[name=delete]');

		// Wait and reload to be safe
		await page.waitFor(2000);
		await page.reload();		

		// Make sure event has been removed - it should now 404
		await page.goto(url+`#event/${id}`);
		await page.waitForSelector('.alert');
		const alert404 = await page.evaluate(() => {
			return document.querySelector('.alert').innerText.includes("404");
		});
		await expect(alert404).toBe(true);
	}, 45000);  
});
