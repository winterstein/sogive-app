import React, { Component } from 'react';
import Login from '../base/youagain';
import { Button } from 'reactstrap';
import _ from 'lodash';

// Plumbing
import DataStore, { getValue } from '../base/plumbing/DataStore';
import Roles from '../base/Roles';
import CRUD from '../base/plumbing/Crud';
import C from '../C';
import Misc from '../base/components/Misc';
import Messaging from '../base/plumbing/Messaging';
// Templates
import MessageBar from '../base/components/MessageBar';
import NavBar from '../base/components/NavBar';
import LoginWidget, { setShowLogin } from '../base/components/LoginWidget';
import PropControl from '../base/components/PropControl';
// Components
import { FieldClearButton } from './SearchPage';
// Pages
import DashboardPage from './DashboardPage';
import SearchPage from './SearchPage';
import AccountPage from './AccountPage';
import AboutPage, { addDataCredit, addFunderCredit } from '../base/components/AboutPage';
import CharityPage from './CharityPage';
import EditCharityPage from './editor/EditCharityPage';
import SimpleEditCharityPage from './editor/SimpleEditCharityPage';
import EditorDashboardPage from './editor/EditorDashboardPage';
import FundRaiserPage from './FundRaiserPage';
import EditFundRaiserPage from './editor/EditFundRaiserPage';
import ManageDonationsPage from './editor/ManageDonationsPage';
import ManageRepeatDonationsPage from './editor/ManageRepeatDonationsPage';
import EditEventPage from './editor/EditEventPage';
import EventPage from './EventPage';
import EventReportPage from './editor/EventReportPage';
import RegisterPage from './RegisterPage';
import TestPage from '../base/components/TestPage';
import MainDivBase from '../base/components/MainDivBase';
import CardShopPage from './CardShopPage';
import CardPage from './CardPage';
import CheckoutPage from './CheckoutPage';

// HACK: Squash "attempt to reuse idempotent Stripe key" error messages - server should be safe now so user doesn't need to see them
Messaging.registerFilter(msg => {
	if (!msg || !msg.type || !msg.text) return true; // ...just in case
	if (msg.type === 'error' && msg.text.match('Keys for idempotent requests')) {
		console.log('Not displaying "500: Keys for idempotent requests..." error message');
		return false;
	}
	return true;
});


const PAGES = {
	event: EventPage,
	editEvent: EditEventPage,
	eventReport: EventReportPage,
	register: RegisterPage,
	fundraiser: FundRaiserPage,
	editFundraiser: EditFundRaiserPage,
	search: SearchPage,
	dashboard: DashboardPage,
	editordashboard: EditorDashboardPage,
	manageDonations: ManageDonationsPage,
	manageRepeatDonations: ManageRepeatDonationsPage,
	account: AccountPage,
	charity: CharityPage,
	edit: EditCharityPage,
	simpleedit: SimpleEditCharityPage,
	about: AboutPage,
	test: TestPage,
	cardshop: CardShopPage,
	card: CardPage,
	checkout: CheckoutPage
};

const PAGE_LABELS = {
	search: "Home",
	about: "About",
	contact: "Contact",
	faq: "FAQ"
}

const EXTERNAL_PAGE_LINKS = {
	about: "https://sogive.org/about.html",
	contact: "https://sogive.org/contact.html",
	faq: "https://sogive.org/faq.html"
}

const SEARCH_QUERY_DATASTORE_PATH = ['widget', 'navbarsearch'];
const SEARCH_QUERY_DATASTORE_PROP = "search_query";

// NB: MainDivBase does this too, but not until after getRoles is called below
Login.app = C.app.service;

addFunderCredit("SMART:Scotland");
addFunderCredit("The Hunter Foundation");
addFunderCredit("Good-Loop");

addDataCredit({author:"Crown Copyright and database right 2017", name:"UK government charity data"});
addDataCredit({author:"Office of the Scottish Charity Regulator (OSCR)", name:"Scottish Charity Register", 
	url:"https://www.oscr.org.uk/charities/search-scottish-charity-register/charity-register-download", license:"Open Government Licence v.2.0"});

// Evaluated on every redraw of MainDivBase so once the promise resolves the extra items appear
const navbarPagesFn = () => {
	let pages = ['search', 'about', 'contact', 'faq'];
	if (!Roles.iCan(C.CAN.test).value) return pages;
	return [...pages];
};

const SearchWidget = () => {
    const searchIcon = <Misc.Icon prefix="fas" fa="search" />;

    const searchQuery = getValue([...SEARCH_QUERY_DATASTORE_PATH, SEARCH_QUERY_DATASTORE_PROP]);
    const onSubmit = (e) => {
        DataStore.setUrlValue("q", searchQuery);
    };

    const url = '#search?q=' + DataStore.getUrlValue('q');
    const submitButton = (
        <a href={url}>
            <Button
                type="submit"
                onClick={onSubmit}
                color="primary"
                className="sogive-search-box"
            >
                Search
            </Button>
        </a>
    );

    return (
        // Unable to use a Form here because it prevents the submitButton navigating to the
        // Search page when the user is on the Charity page (the PropControl prop gets appended
        // to the URL before the '#search' page anchor). (Unfortunately this means the user
        // can't press 'Enter' in the textbox to search, they must click the submit button.)
        <div className="navbar-search-widget ml-auto">
            <PropControl
                path={SEARCH_QUERY_DATASTORE_PATH}
                prop={SEARCH_QUERY_DATASTORE_PROP}
                type="search"
                placeholder="Enter a charity's name"
                prepend={searchIcon}
                append={submitButton}
                size="lg"
            />
            <FieldClearButton />
        </div>
    );
}

/**
	Top-level: tabs
*/
const MainDiv = () => {
		
	return (<MainDivBase
		homeLink={C.app.website}
		pageForPath={PAGES}
		navbarLabels={PAGE_LABELS}
		navbarPages={navbarPagesFn}
		navbarDarkTheme={false}
		navbarBackgroundColour='white'
		// securityCheck: ({page}) => throw error / return true
		// SecurityFailPage: ?JSX
		defaultPage='search'
		fullWidthPages={['search']}
		navbarExternalLinks={EXTERNAL_PAGE_LINKS}
		navbarChildren={<SearchWidget/>}
	/>);
};

export default MainDiv;
