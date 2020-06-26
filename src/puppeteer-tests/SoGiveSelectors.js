/**
 * Collection of CSS selectors for various elements across Sogive
 * Organised into object by page/widget
 * Could maybe add a '-defualt' to denote a field that contains a default value
 * Safer way would be to have fillInForm check for an entry in the field
 */
const Event = {};
Event.Main = {
	EventList: `#event > div > div:nth-child(2)`,
	CreateEvent: 'button[name=create-item]', //Won't appear in DOM until CREATE_EDIT_EVENT has been clicked. Can also navigate directly to sogive.org/#editEvent
	CreateEditButton: `#event small > a`
};
Event.EditEventForm = {
	name: `input[name=name]`,
	date: `input[name=date]`,
	description: `textarea[name=description]`,
	"web-page": `input[name=url]`,
	"matched-funding": `input[name=matchedFunding]`,
	sponsor: `input[name=matchedFundingSponsor]`,
	"user-picks-charity": `#editEvent > div > div:nth-child(4) > div.panel-body > div:nth-child(9) > div > label > input[type="checkbox"]`,
	"user-teams": `#editEvent > div > div:nth-child(4) > div.panel-body > div:nth-child(10) > div > label`
};
Event.ImagesAndBranding = {
	backdrop: `input[name=backgroundImage]`,
	logo: `input[name=logoImage]`,
	banner: `input[name=bannerImage]`
};
Event.TicketTypes = {
	CreateButton: `#editEvent > div > div:nth-child(6) > div.panel-body > button`,
	ticketName: `#editEvent input[placeholder="e.g. The Wee Wander"]`,
	subtitle: `#editEvent > div > div:nth-child(6) > div.panel-body > div > div:nth-child(3) > input`,
	kind: `#editEvent > div > div:nth-child(6) > div.panel-body > div > div:nth-child(4) > input`,
	price: `#editEvent > div > div:nth-child(6) > div.panel-body > div > div:nth-child(5) > span > input`,
	stock: `#editEvent input[name="stock"]`,
	description: `#editEvent textarea[name="description"]`,
	"attendee-noun": `#editEvent > div > div:nth-child(6) > div.panel-body > div > div:nth-child(8) > input`,
	"attendee-icon": `#editEvent > div > div:nth-child(6) > div.panel-body > div > div:nth-child(9) > div > input`,
	"invite-only-checkbox": `#editEvent > div > div:nth-child(6) > div.panel-body > div > div.container-fluid > div > div:nth-child(1) > div > div:nth-child(2) > div > label > input[type="checkbox"]`,
	"post-purchase-link": `#editEvent > div > div:nth-child(6) > div.panel-body > div > div:nth-child(10) > div > input`,
	"post-purchase-cta": `#editEvent > div > div:nth-child(6) > div.panel-body > div > div:nth-child(11) > div > input`,
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
Fundraiser.EditFundraiser = {
	name: `#editFundraiser > div > div.padded-block > div:nth-child(4) > input`,
	photo: `#editFundraiser > div > div.padded-block > div:nth-child(5) > div > input`,
	description: `#editFundraiser > div > div.padded-block > div:nth-child(6) > input`,
	charity: `#editFundraiser > div > div.padded-block > div:nth-child(7) > input`,
	target: `#editFundraiser > div > div.padded-block > div:nth-child(8) > span > input`,
	"set-donated": `#editFundraiser > div > div.padded-block > div:nth-child(9) > span > input`,
	"set-donor-count": `#editFundraiser > div > div.padded-block > div:nth-child(10) > input`,
	"your-name": `#editFundraiser > div > div.padded-block > div:nth-child(11) > input`,
	"your-photo": `#editFundraiser > div > div.padded-block > div:nth-child(12) > div > input`,
	about: `#editFundraiser > div > div.padded-block > div:nth-child(13) > textarea`,
	story: `#editFundraiser > div > div.padded-block > div:nth-child(14) > textarea`
};

const General = {};
General.CRUD = {
	Save: `div.SavePublishDiscard > button.btn.btn-default`,
	Publish: `div.SavePublishDiscard > button.btn.btn-primary`,
	Discard: `div.SavePublishDiscard > button.btn.btn-warning`,
	Delete: `div.SavePublishDiscard > button.btn.btn-danger`
};
General.CharityPageImpactAndDonate = {
	DonationButton: `button.btn.btn-lg.btn-primary`,//Unforunately isn't anything more concrete to identify donation button specifically
	Next: `div.WizardStage div.nav-buttons.clearfix button.pull-right`,
	Previous: `div.WizardStage > div.nav-buttons.clearfix > button.btn-lg.pull-left`,
	Submit: `div.section.donation-amount > form > button`,
	TestSubmit: `div.section.donation-amount > small > button`,
	Stripe: `div.PaymentRequestButton`,
    
	amount: `div.WizardStage > div.section.donation-amount > div.form-group > span > input`,
	"hide-amount-checkbox": `div.WizardStage > div.section.donation-amount > div:nth-child(2) > div > label > input[type="checkbox"]`,
	name: `input[name="donorName"]`,
	email: `input[name="donorEmail"]`,
	address: `input[name="donorAddress"]`,
	postcode: `input[name="donorPostcode"]`,
	"consent-checkbox": `input[type="checkbox"]`,
	"anon-checkbox": `input[type="checkbox"]`,
	message: `div.WizardStage > div.section.donation-amount > div > textarea`,
	"include-tip-checkbox": `div.WizardStage > div:nth-child(1) > div.padded-block > div:nth-child(1) > div > label > input[type="checkbox"]`,
	tip: `div.WizardStage > div:nth-child(1) > div.padded-block > div.form-group > span > input`,
	"card-number": `div.WizardStage > div:nth-child(1) > div > form > div:nth-child(2) > div > div`,
	"expiry-date": `div.WizardStage > div:nth-child(1) > div > form > div:nth-child(3) > div:nth-child(1) > div`,
	cvc: `form > div:nth-child(3) > div:nth-child(2) > div`,

	giftAidOwnMoney: `input[name="giftAidOwnMoney"]`
};
General.Loading = `div.loader-box`;

const Register = {
	Add: `#register > div > div.Wizard > div.WizardStage > div:nth-child(1) > div > ul > li > div.controls > button`,
	EmptyBasket: `#register > div > div.Wizard > div.WizardStage > button`,
	Next: `#register > div > div.Wizard > div.WizardStage > div.nav-buttons.clearfix > button.pull-right`,
	SetupFundraiser: `#register > div > div.Wizard > div.WizardStage > div.ConfirmedTicketList > div > div > div > div:nth-child(2) > div > a`,
	Submit: `#register > div > div.Wizard > div.WizardStage > div:nth-child(1) > div.padded-block > div > form > button`,
	TestSubmit: `#register > div > div.Wizard > div.WizardStage > div:nth-child(1) > div.padded-block > div > small > button`,
	FreeTicketSubmit: `#register > div > div.Wizard > div.WizardStage > div:nth-child(1) > div.padded-block > div > button`,
	name: `#register > div > div.Wizard > div.WizardStage > div:nth-child(1) > div > div > div:nth-child(1) > input`,
	email: `#register > div > div.Wizard > div.WizardStage > div:nth-child(1) > div > div > div:nth-child(2) > input`,
	address: `#register > div > div.Wizard > div.WizardStage > div:nth-child(1) > div > div > div:nth-child(3) > div:nth-child(1) > textarea`,
	"phone-number": `#register > div > div.Wizard > div.WizardStage > div:nth-child(1) > div > div > div:nth-child(3) > div:nth-child(2) > input`,
	"join-team": `#register > div > div.Wizard > div.WizardStage > div:nth-child(1) > div > div > div:nth-child(3) > div.container-fluid > div > div:nth-child(1) > div > input`,
	"create-team": `#register > div > div.Wizard > div.WizardStage > div:nth-child(1) > div > div > div:nth-child(3) > div.container-fluid > div > div:nth-child(2) > div > input`,
	charity: `#register > div > div.Wizard > div.WizardStage > div:nth-child(1) > div.padded-block > div > input`,
	'select-first-charity-checkbox': `div.results-list > div.SearchResult.row > a.text-summary`,
};

const Search = {};
Search.Main = {
	SearchField: `input[name=rawq]`,
	SearchButton: `button.sogive-search-box`,
	ResultsList: `.SearchResults div.results-list`,
	FirstResult: `.SearchResults div.results-list div.SearchResult a`
};

// sogive.org/#edit
const Editor = {
	story: '#edit > div > div.CardAccordion > div:nth-child(1) > div.panel-body > div > div:nth-child(22) > div > div > div:nth-child(1) > div > textarea'
};

// Selectors that are used across all platfroms are written directly in SelectorsMaster
const CommonSelectors = {
	logIn: '.login-link',
	logInEmail: '#loginByEmail input[name="email"]',
	logInPassword: '#loginByEmail input[name="password"]',
	Save: '.SavePublishDiscard button[name="save"]',
	SaveAs: '.SavePublishDiscard button[name="save-as"]',
	Publish: '.SavePublishDiscard button[name="publish"]',
	DiscardEdits: '.SavePublishDiscard button[name="discard-edits"]',
	Unpublish: '.SavePublishDiscard button[name="unpublish"]',
	Delete: '.SavePublishDiscard button[name="delete"]',
	facebookLogin: '.social-signin .facebook',
	twitterLogin: '.social-signin .twitter'
};

module.exports = {
	Event,
	Editor,
	Fundraiser,
	General,
	Register,
	Search,
	CommonSelectors,
};
