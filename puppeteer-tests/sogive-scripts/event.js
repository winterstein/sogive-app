const puppeteer = require('puppeteer');
const {
    fillInForm,
    eventIdFromName,
    disableAnimations,
    APIBASE
} = require('../test-base/res/UtilityFunctions');
const {SoGiveSelectors, CommonSelectors} = require('../test-base/utils/SelectorsMaster');
const {Event} = SoGiveSelectors;

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
    await page.waitForSelector(CommonSelectors.Delete);     
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
    await page.click(Event.Main.CreateEvent);
    
    await page.waitForSelector(Event.Main.CreateEditButton);
    await page.click(Event.Main.CreateEditButton);
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
    //Wait for publish to go through before returning control. Quite a crude method, using waitForNavigation wasn't working
    await page.click(CommonSelectors.Publish);
    await page.waitForSelector(`${CommonSelectors.Publish}[disabled]`, {hidden: true});
}

/**Deletes the given event. Returns true/false on success/failure */
async function deleteEvent({page, eventId, eventName}) {
    if(eventId) {
        await gotoEditEvent({page, eventId});
        await page.click(CommonSelectors.Delete);
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

module.exports = {
    createNewEvent,
    deleteEvent,
    goto,
    gotoEditEvent,
    gotoResult,
    registerForEvent
};
