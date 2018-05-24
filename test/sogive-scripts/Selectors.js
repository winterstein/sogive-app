/**
 * Collection of CSS selectors for various elements across Sogive
 * Organised into object by page/widget
 */
const Event = {};
Event.Main = {
    EventList: `#event > div > div:nth-child(2)`,
    CreateEditButton: `#event > div > div:nth-child(4) > a`,
    CreateEvent: `#editEvent > div > button` //Won't appear in DOM until CREATE_EDIT_EVENT has been clicked. Can also navigate directly to sogive.org/#editEvent
};
Event.EditEventForm = {
    name: `#editEvent > div > div:nth-child(3) > div.panel-body > div:nth-child(1) > input`,
    date: `#editEvent > div > div:nth-child(3) > div.panel-body > div:nth-child(2) > input`,
    description: `#editEvent > div > div:nth-child(3) > div.panel-body > div:nth-child(3) > textarea`,
    "web-page": `#editEvent > div > div:nth-child(3) > div.panel-body > div:nth-child(4) > div > input`,
    "matched-funding": `#editEvent > div > div:nth-child(3) > div.panel-body > div:nth-child(5) > input`,
    sponsor: `#editEvent > div > div:nth-child(3) > div.panel-body > div:nth-child(6) > input`,
    "user-picks-charity": `#editEvent > div > div:nth-child(3) > div.panel-body > div:nth-child(7) > div > label > input[type="checkbox"]`,
    "user-teams": `#editEvent > div > div:nth-child(3) > div.panel-body > div:nth-child(8) > div > label > input[type="checkbox"]`
};
Event.ImagesAndBranding = {
    backdrop: `#editEvent > div > div:nth-child(4) > div.panel-body > div:nth-child(1) > div > input`,
    logo: `#editEvent > div > div:nth-child(4) > div.panel-body > div:nth-child(2) > div > input`,
    banner: `#editEvent > div > div:nth-child(4) > div.panel-body > div:nth-child(3) > div > input`
};
Event.TicketTypes = {
    CreateButton: `#editEvent > div > div:nth-child(5) > div.panel-body > button`,
    name: `#editEvent > div > div:nth-child(5) > div.panel-body > div > div:nth-child(2) > input`,
    subtitle: `#editEvent > div > div:nth-child(5) > div.panel-body > div > div:nth-child(3) > input`,
    kind: `#editEvent > div > div:nth-child(5) > div.panel-body > div > div:nth-child(4) > input`,
    price: `#editEvent > div > div:nth-child(5) > div.panel-body > div > div:nth-child(5) > span > input`,
    stock: `#editEvent > div > div:nth-child(5) > div.panel-body > div > div.container-fluid > div > div:nth-child(1) > div > div.form-group > input`,
    description: `#editEvent > div > div:nth-child(5) > div.panel-body > div > div:nth-child(7) > input`,
    "attendee-noun": `#editEvent > div > div:nth-child(5) > div.panel-body > div > div:nth-child(8) > input`,
    "attendee-icon": `#editEvent > div > div:nth-child(5) > div.panel-body > div > div:nth-child(9) > div > input`,
    "invite-only-checkbox": `#editEvent > div > div:nth-child(5) > div.panel-body > div > div.container-fluid > div > div:nth-child(1) > div > div:nth-child(2) > div > label > input[type="checkbox"]`,
    "post-purchase-link": `#editEvent > div > div:nth-child(5) > div.panel-body > div > div:nth-child(10) > div > input`,
    "post-purchase-cta": `#editEvent > div > div:nth-child(5) > div.panel-body > div > div:nth-child(11) > div > input`,
};
Event.Register = {
    RegisterButton: `#event > div > center:nth-child(4) > a`,
    EmptyBasket:`#register > div > div.Wizard > div.WizardStage > button`
};

const Fundraiser = {};
Fundraiser.Main = {
    FundraiserList: `#fundraiser > div > div:nth-child(2)`,
    DonationButton: `#FundRaiserPage > div.vitals.row > div:nth-child(2) > div > div.progress-details > button`
};

const General = {};
General.CRUD = {
    Save: `div.SavePublishDiscard > button.btn.btn-default`,
    Publish: `#editEvent > div > div.SavePublishDiscard > button.btn.btn-primary`,
    Discard: `div.SavePublishDiscard > button.btn.btn-warning`,
    Delete: `div.SavePublishDiscard > button.btn.btn-danger`
};
General.DonationForm = {
    DonationButton: `button.btn.btn-lg.btn-primary`,//Unforunately isn't anything more concrete to identify donation button specifically
    Next: `div.WizardStage div.nav-buttons.clearfix button.pull-right`,
    Submit: `div.WizardStage > div.section.donation-amount > form > button`,
    TestSubmit: `div.WizardStage > div.section.donation-amount > small > button`,
    amount: `div.WizardStage > div.section.donation-amount > div.form-group > span > input`,
    "hide-amount-checkbox": `div.WizardStage > div.section.donation-amount > div:nth-child(2) > div > label > input[type="checkbox"]`,
    name: `div.WizardStage > div.section.donation-amount > div:nth-child(2) > input`,
    email: `div.WizardStage > div.section.donation-amount > div:nth-child(3) > input`,
    address: `div.WizardStage > div.section.donation-amount > div:nth-child(4) > input`,
    postcode: `div.WizardStage > div.section.donation-amount > div:nth-child(5) > input`,
    "consent-checkbox": `div.WizardStage > div.section.donation-amount > div:nth-child(6) > div > label > input[type="checkbox"]`,
    "anon-checkbox": `div.WizardStage > div.section.donation-amount > div:nth-child(7) > div > label > input[type="checkbox"]`,
    message: `div.WizardStage > div.section.donation-amount > div > textarea`,
};
General.Loading = `div.loader-box`;

const Search = {};
Search.Main = {
    SearchField: `#formq`,
    SearchButton: `span.sogive-search-box.input-group-addon`,
    ResultsList: `#search div.results-list`
};

module.exports = {
    Event,
    Fundraiser,
    General,
    Search
};
