import React, { Component } from 'react';
import Login from '../base/youagain';
import { Container } from 'reactstrap';
import _ from 'lodash';

// Plumbing
import DataStore from '../base/plumbing/DataStore';
import Roles from '../base/Roles';
import CRUD from '../base/plumbing/Crud';
import C from '../C';
import Misc from '../base/components/Misc';
import Messaging from '../base/plumbing/Messaging';
// Templates
import MessageBar from '../base/components/MessageBar';
import NavBar from '../base/components/NavBar';
import LoginWidget, { setShowLogin } from '../base/components/LoginWidget';
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

// NB: MainDivBase does this too, but not until after getRoles is called below
Login.app = C.app.service;

addFunderCredit("SMART:Scotland");
addFunderCredit("The Hunter Foundation");
addDataCredit({author:"Crown Copyright and database right 2017", name:"UK government charity data"});
addDataCredit({author:"Office of the Scottish Charity Regulator (OSCR)", name:"Scottish Charity Register", 
	url:"https://www.oscr.org.uk/charities/search-scottish-charity-register/charity-register-download", license:"Open Government Licence v.2.0"});

// Evaluated on every redraw of MainDivBase so once the promise resolves the extra items appear
const navbarPagesFn = () => {
	let pages = ['dashboard', 'search'];
	if (!Roles.iCan(C.CAN.test).value) return pages;
	return [...pages, 'event', 'fundraiser'];
};

/**
		Top-level: tabs
*/
const MainDiv = () => {
	
	
	return (<MainDivBase
		pageForPath={PAGES}
		navbarPages={navbarPagesFn}
		// securityCheck: ({page}) => throw error / return true
		// SecurityFailPage: ?JSX
		defaultPage='search'
		fullWidthPages={['search']}
	/>);
};

export default MainDiv;
