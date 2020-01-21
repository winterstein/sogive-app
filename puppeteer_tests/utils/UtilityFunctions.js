/* eslint-disable no-await-in-loop */
const fs = require('fs');
const $ = require('jquery');
const { General, CommonSelectors } = require('./SoGiveSelectors');

// set when calling Jest CLI with --testURL $url
// const APIBASE = window.location.href;

/**
 * Takes an object in form {CSS_SELECTOR: value},
 * and fills in form accordingly
 */
async function fillInForm({page, Selectors, data}) {
	const keys = Object.keys(data);
	for(let i=0; i<keys.length; i++) {
		const key = keys[i];
		const selector = Selectors[key];

		//Clicks checkbox if value doesn't match boolean provided
		if( await page.$eval(selector, e => e.type) === 'checkbox' ) {
			//Would be nicer to have this as one if statement, but there is a bit of faff around passing arguments into page.$eval()
			const checkValue = await page.$eval(selector, e => e.checked);
			if( checkValue != data[key] ) await page.click(selector);
		}
		// Select drop-down menu option
		else if( await page.$eval(selector, e => e.tagName) === 'SELECT' ) {
			await page.select(selector, data[key]);
		} else {
			await page.click(selector);
			//Check for default value. Clear field if found
			if(await page.$eval(selector, e => e.value)) {
				await page.keyboard.down('Control');
				await page.keyboard.press('a');
				await page.keyboard.up('Control');
				await page.keyboard.press('Backspace');
			} 
			await page.keyboard.type(`${data[key]}`);
		}
	}
}

/**Login to app. Should work for both SoGive and Good-loop 
 * Make sure that you are actually on a page with a clickable login button before running this!
 * @param selectors CSS selectors for the given page
 * @param url option param. Will go to the url before attempting to log in
 * @param service how are you loggin in? Can be email, Twitter or Facebook
*/
async function login({browser, page, username, password, Selectors=CommonSelectors, service='email'}) {
	if(!username || !password) throw new Error('UtilityFunctions -- no username/password provided to login');

	await page.waitForSelector(Selectors.logIn);
	await page.click(Selectors.logIn);
	// Wait for CSS transition to complete
	// Caused puppeteer to click on wrong div sometimes
	await page.waitFor(400);

	if (service === 'email') {
		await page.waitForSelector(Selectors.logInEmail);
		await page.waitForSelector(Selectors.logInPassword);
	
		await page.click(Selectors.logInEmail);
		await page.keyboard.type(username);
		await page.click(Selectors.logInPassword);
		await page.keyboard.type(password);
		await page.keyboard.press('Enter');
		
		await page.waitForSelector(Selectors.logInEmail, {hidden: true});
	}

	if (service === 'twitter') {
		await page.waitForSelector(Selectors.twitterLogin);
		await page.click(Selectors.twitterLogin);
		await page.waitForSelector(Selectors.apiUsername);
	
		await page.click(Selectors.apiUsername);
		await page.keyboard.type(username);
		await page.click(Selectors.apiPassword);
		await page.keyboard.type(password);
	
		await page.click(Selectors.apiLogin);
		// twitter, for some reason, wants you
		// to enter the exact same username & password
		// again, but on a different page
		await page.waitForNavigation({ waitUntil: 'load'});
		await page.waitFor(5000); // Give Twitter login a second to process
		// await page.click(TwitterSelectors.username);
		// await page.keyboard.type(twitterUsername);
		// await page.click(TwitterSelectors.password);
		// await page.keyboard.type(twitterPassword);
		// await page.click(TwitterSelectors.login);
	}

	if (service === 'facebook') {

		if (!browser) throw new Error('login function needs to be passed a browser object when logging in via Facebook');

		// return promise and await below
		// workaround for issue where Jest would reach end of test
		// and deem it a success without waiting for the browser.on
		// callback to finish executing
		let fbResolve;
		let fbLoginFinished = new Promise(function(resolve, reject) { fbResolve = resolve; });
		fbLoginFinished.resolve = fbResolve;

		browser.on('targetcreated', async(target) => {
			if(target._targetInfo.type !== 'page') return;
			const fbPage = await target.page();

			await fbPage.waitForSelector(Selectors.username);
			await fbPage.click(Selectors.username);
			await fbPage.keyboard.type(username);

			await fbPage.click(Selectors.password);
			await fbPage.keyboard.type(password);
			await fbPage.click(Selectors.login);

			// only seems to appear once...
			// await fbPage.waitForSelector(FacebookSelectors.continue);
			// await fbPage.click(FacebookSelectors.continue);

			fbLoginFinished.resolve();
		});

		// trigger above code to handle
		// facebook login page
		// second click to handle popup being blocked
		await page.click(Selectors.facebookLogin);
		await page.click(Selectors.facebookLogin);

		// check that user is logged in, fail test if not
		await fbLoginFinished;
	}
}

/**Fills in the donation form with details provided
 * @param Amount {amount: 0, hide-amount-checkbox: true}
 * @param Details {name: '', email: '', address: '', postcode: '', consent-checkbox: true, anon-checkbox: true}
 * @param Message turns out that charity and fundraiser donation forms are different. This is a hack to allow donate() to be used in both places.
 *  Will consider splitting this up if too many changes are needed.
 */
async function donate({
	page, 
	Amount, 
	GiftAid,
	Details,
	Message,
	Payment
}) {
	await page.waitForSelector(General.CharityPageImpactAndDonate.DonationButton);
	await page.click(General.CharityPageImpactAndDonate.DonationButton);
    
	await page.waitForSelector(General.CharityPageImpactAndDonate.amount);
	if(Amount) {
		await page.click(General.CharityPageImpactAndDonate.amount);
		//clear field of default value
		await page.keyboard.down('Control');
		await page.keyboard.press('Backspace');
		await page.keyboard.up('Control');

		await page.keyboard.type(`${Amount.amount}`);
	}
	if(Amount && Amount["hide-amount-checkbox"]) {
		await page.click(General.CharityPageImpactAndDonate["hide-amount-checkbox"]);
	}
	await advanceWizard({page});

	// await page.waitForSelector(General.CharityPageImpactAndDonate.Previous);//This condition never triggers for some reason. Only seems to happen for logged-out donations
	// await page.waitForSelector(`label.radio-inline`);

	if(GiftAid) {
		//need to make selectors for fillInForm to work with
		await advanceWizard({page});
	}

	await page.waitForSelector(General.CharityPageImpactAndDonate.name);
	if(Details) { 
		await fillInForm({
			page,
			data: Details,
			Selectors: General.CharityPageImpactAndDonate
		});
	}
	await advanceWizard({page});

	if(Message) {
		await page.waitForSelector(General.CharityPageImpactAndDonate.message);
		await fillInForm({
			page,
			data: Message,
			Selectors: General.CharityPageImpactAndDonate
		});
		await advanceWizard({page});    
	}

	//For traditional (non-Stripe) page
	if(Payment) {
		await fillInForm({
			page,
			data: Payment,
			Selectors: General.CharityPageImpactAndDonate
		});
		await page.click(General.CharityPageImpactAndDonate.Submit);
	} else{
		await page.waitForSelector(General.CharityPageImpactAndDonate.TestSubmit);
		await page.click(General.CharityPageImpactAndDonate.TestSubmit);
	}

	//Wait for Receipt to appear before closing
	await page.waitForSelector(`div.WizardStage > div.text-center`);
}

async function advanceWizard({page}) {
	const url = await page.evaluate(() => window.location.href);
	const stage = url.match(/.*dntnStage=(.?).*/)? url.match(/.*dntnStage=(.?).*/)[1] : 0;
	let gotoURL;
	if(url.includes('dntnStage')) {
		gotoURL = url.replace(/(.*)(dntnStage=.?)(.*)/, `$1dntnStage=${+stage+1}$3`);
	} else if(url.includes('?')) {
		gotoURL = url + `&dntnStage=${+stage+1}`;
	} else{
		gotoURL = url+`?dntnStage=${+stage+1}`;
	}
	await page.goto(gotoURL);
}

async function soGiveFailIfPointingAtProduction({page}) {
	const endpoint = await page.evaluate( () => window.ServerIO.APIBASE);
	if( endpoint.match(/\/\/app.sogive.org/) || window.location.href.match(/\/\/app.sogive.org/) ) throw new Error("Test service is pointing at production server! Aborting test.");
}

module.exports = {
	login,
	soGiveFailIfPointingAtProduction,
	donate,
	fillInForm
};
