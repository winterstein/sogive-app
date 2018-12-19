const puppeteer = require('puppeteer');
const {APIBASE, eventIdFromName, login, soGiveFailIfPointingAtProduction, fillInForm} = require('../test-base/res/UtilityFunctions');
const {username, password} = require('../../../logins/sogive-app/puppeteer.credentials');
const {CommonSelectors} = require('../test-base/utils/SelectorsMaster');
const Event = require('../sogive-scripts/event');

const eventData = {
    name: Date.now(),
    description: "Resistance is futile",
    "web-page": 'https://developers.google.com/web/tools/puppeteer/',
    "matched-funding": 10,
    sponsor: "Locutus of Borg",

    backdrop: 'https://i.pinimg.com/originals/a4/42/b9/a442b9891265ec69c78187a030b0753b.jpg',

    ticketName: "Assimile",
    stock: 1000,
    "invite-only-checkbox": true,
    "attendee-noun": "Inferior, carbon-based, lifeform",
    "attendee-icon": 'https://h5p.org/sites/default/files/h5p/content/10583/images/file-56f540bfae28b.jpg'
};

test('Create an event', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    await page.goto(`${APIBASE}#event`);
    await page.waitForSelector('.loader-box');

    // await soGiveFailIfPointingAtProduction({page});

    await login({page, username, password});  

    // Set up an event
    await page.click(Event.Main.CreateEvent);
    await page.waitForSelector(Event.Main.CreateEditButton);
    await page.click(Event.Main.CreateEditButton);

    await fillInForm({
        page,
        data: eventData,
        Selectors: Object.assign(
            Event.EditEventForm,
            Event.ImagesAndBranding,
            Event.TicketTypes
        ) 
    });
    await page.click(CommonSelectors.Publish);
    await page.waitForSelector(`${CommonSelectors.Publish}[disabled]`, {hidden: true});
}, 30000);

test('Delete event created', async() => {
    const browser = window.__BROWSER__;
    const page = await browser.newPage();

    const eventId = await eventIdFromName({page, eventName: eventData.name});
    await page.goto(`${APIBASE}#editEvent/${eventId}`);
    await page.waitForSelector(CommonSelectors.Delete);
    await page.click(CommonSelectors.Delete);
});
