const puppeteer = require('puppeteer');
const {
    fillInForm,
    disableAnimations,
    APIBASE
} = require('../test-base/res/UtilityFunctions');
const {
    Event, 
    General
} = require("./Selectors");

async function goto({page, eventId = ''}) {
    page.goto(`${APIBASE}#event/${eventId}`);   
    await page.waitForSelector('.loader-box');    
    await page.waitForSelector('.loader-box', {hidden: true}); 
}

async function gotoResult({page, selectorOrInteger = 1}) {
    let event_selector = Event.Main.EventList;

    if(Number.isInteger(selectorOrInteger)) event_selector += `> div:nth-child(${selectorOrInteger}) > a`;
    if(typeof selectorOrInteger === 'string') event_selector += `> div > a[href='#event/${selectorOrInteger}']`;
    event_selector += ` a`;

    await page.click(event_selector);
}

async function gotoEditEvent({page, eventId}) {
    page.goto(`${APIBASE}#editEvent/${eventId}`);   
    await page.waitForSelector('.loader-box');    
    await page.waitForSelector('.loader-box', {hidden: true});   
}

async function registerForEvent({
    page,
    register,
    details,
    charity 
}) {
    await page.click(Event.Register.RegisterButton);
    //Is a known issue with tickets from other events being left in the basket: 
    //register won't lead to the event you actually want
    await page.click(Event.Register.EmptyBasket);

}

/**
 * @param eventName allows user to set name of event to be created. Useful mostly to allow puppeteer to delete event later on
 * @param event {name, date, description, web-page, matched-funding, sponsor, user-picks-charity, user-teams}
 * @param image {backdrop, logo, banner}
 * @param ticket {name, subtitle, kind, price, stock, description}
 * @param merch this hasn't been hooked up yet. Option doesn't work on SoGive anyway
 */
async function createNewEvent({
    page,
    event,
    image,
    ticket,
    merch
}) {
    await page.click(Event.Main.CreateEditButton);
    await page.click(Event.Main.CreateEvent);
    //fill in form details
    if(event) {
        await fillInForm({
            page, 
            data: event,
            Selectors: Event.EditEventForm
        });
    }
    if(image) {
        await fillInForm({
            page,
            data: image,
            Selectors: Event.ImagesAndBranding
        });
    }
    if(ticket) {
        await page.click(Event.TicketTypes.CreateButton);
        await fillInForm({
            page,
            data: ticket,
            Selectors: Event.TicketTypes
        });   
    }
    await page.click(General.CRUD.Publish);
    //await page.waitForNavigation({waitUntil: "networkidle0"});
}

/**Deletes the given event. Returns true/false on success/failure */
async function deleteEvent({page, eventId, eventName}) {
    if(eventId) {
        await gotoEditEvent({page, eventId});
        await page.click(General.CRUD.Delete);
        return true;
    }
    else if(eventName) {
        const Id = await eventIdFromName({page, eventName});     
        await deleteEvent({page, eventId: `${Id}`});
    }
    else{
        return false;
    }
}

//Event name unfortunately can't be selected via CSS tags: it's not within a tag
//Can, however, scrape all data within anchor tag. Once found, can make a valid selector
//based on the position of the button within the event list (div:nth-child(i)).
async function eventIdFromName({page, eventName}) {
    return page.evaluate((event) => {
        const iDRegex = /id:\s(.*)/;
        const numberOfEvents = document.querySelectorAll(`#event > div > div:nth-child(2) > div.ListItemWrapper`).length;
        for(let i = 1; i <= numberOfEvents; i++) {
            const innerText = document.querySelector(`#event > div > div:nth-child(2) > div:nth-child(${i})`).innerText;
            if(innerText.includes(event)) {
                return iDRegex.exec(innerText)[1];
            }
        }
        return '';
    }, eventName);
}

module.exports = {
    createNewEvent,
    deleteEvent,
    goto,
    gotoEditEvent,
    gotoResult,
    registerForEvent
};
