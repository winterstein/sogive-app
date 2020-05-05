import React, { Component } from 'react';
import Login from 'you-again';
import { assert } from 'sjtest';
import { modifyHash } from 'wwutils';
import _ from 'lodash';

// Plumbing
import DataStore from '../base/plumbing/DataStore';
import Roles from '../base/Roles';
import C from '../C';
import Messaging from '../base/plumbing/Messaging';
// Templates
import MessageBar from '../base/components/MessageBar';
import NavBar from '../base/components/NavBar';
import LoginWidget, { setShowLogin } from '../base/components/LoginWidget';
// Pages
import DashboardPage from './DashboardPage';
import SearchPage from './SearchPage';
import AccountPage from './AccountPage';
import AboutPage from '../base/components/AboutPage';
import CharityPage from './CharityPage';
import EditCharityPage from './editor/EditCharityPage';
import SimpleEditCharityPage from './editor/SimpleEditCharityPage';
import EditorDashboardPage from './editor/EditorDashboardPage';
import FundRaiserPage from './FundRaiserPage';
import EditFundRaiserPage from './editor/EditFundRaiserPage';
import ManageDonationsPage from './editor/ManageDonationsPage';
import EditEventPage from './editor/EditEventPage';
import EventPage from './EventPage';
import EventReportPage from './editor/EventReportPage';
import RegisterPage from './RegisterPage';
import E404Page from '../base/components/E404Page';
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

Login.app = C.app.service;

/**
		Top-level: tabs
*/
const MainDiv = () => {
	// which pages?
	let pages = ['dashboard', 'search'];
	if (Roles.iCan(C.CAN.test).value) { // TODO for everyone, not just dev
		pages = pages.concat(['event', 'fundraiser']);
	}
	
	return <MainDivBase pageForPath={PAGES}
		navbarPages={pages}
		// securityCheck: ({page}) => throw error / return true
		// SecurityFailPage: ?JSX
		defaultPage='search'
	/>
}; // ./MainDiv

export default MainDiv;
