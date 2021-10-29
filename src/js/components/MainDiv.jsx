import React, { Component, useState } from 'react';
import Login from '../base/youagain';
import { Button, Input, InputGroup, InputGroupAddon } from 'reactstrap';
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
import AboutPage from './AboutPage';
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
import HomePage from './HomePage';
import MethodPage from './MethodPage';
import BlogPage from './BlogPage';
import FinancialAdvisersPage from './FinancialAdvisersPage';
import CorporatesPage from './CorporatesPage';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import CareersPage from './CareersPage';
import TermsPage from './TermsPage';
import { modifyHash, stopEvent } from '../base/utils/miscutils';
import Icon from '../base/components/Icon';

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
	checkout: CheckoutPage,
	home: HomePage,
	methodology: MethodPage,
	blog: BlogPage,
	financialadvisers : FinancialAdvisersPage,
	corporates : CorporatesPage,
	privacypolicy : PrivacyPolicyPage,
	terms: TermsPage, 
	careers: CareersPage,
};

const PAGE_LABELS = {
	home: "Home",
	search: "Top Charities",
	methodology: "Methodology",
	about: "About Us",
	blog: "Blog",
	financialadvisers: "Financial Advisers",
	corporates: "Corporates",
	privacypolicy: "Privacy Policy",
	terms: "Terms of Service", 
	careers: "Careers",
}

const EXTERNAL_PAGE_LINKS = {
	// about: "https://sogive.org/about.html",
	// contact: "https://sogive.org/contact.html",
	// faq: "https://sogive.org/faq.html"
}

// This part is for the old AboutPage, delete later
// NB: MainDivBase does this too, but not until after getRoles is called below
// Login.app = C.app.service;

// addFunderCredit("SMART:Scotland");
// addFunderCredit("The Hunter Foundation");
// addFunderCredit("Good-Loop");

// addDataCredit({ author: "Crown Copyright and database right 2017", name: "UK government charity data" });
// addDataCredit({
// 	author: "Office of the Scottish Charity Regulator (OSCR)", name: "Scottish Charity Register",
// 	url: "https://www.oscr.org.uk/charities/search-scottish-charity-register/charity-register-download", license: "Open Government Licence v.2.0"
// });

// Evaluated on every redraw of MainDivBase so once the promise resolves the extra items appear
const navbarPagesFn = () => {
	let pages = ['home', 'search', 'methodology', 'about', 'blog'];
	if (!Roles.iCan(C.CAN.test).value) return pages;
	return [...pages];
};

/**
 * navbar search widget
 */
const SearchWidget = () => {
	// NB: PropControl or Input + useState? 
	// PropControl is best if the data is shared with other components, or if the data should be maintained across page changes, or if extras like help and error text are wanted. 
	// useState is best for purely local state.
	let [q, setQ] = useState("");
	const onSubmit = (e) => {
		stopEvent(e);
		modifyHash(['search'], {q});
	};

	return (
		<div className="navbar-search-widget ml-auto">
			<form onSubmit={onSubmit}>
				<InputGroup>
					<Input type="search"
						value={q} onChange={e => setQ(e.target.value)}
						placeholder="Search for a charity"
					/>
					<InputGroupAddon addonType="append"><Button color="light"><Icon /* NB: color="grey" looks ugly for this icon */ name="search" onClick={onSubmit} /></Button></InputGroupAddon>
				</InputGroup>
			</form>
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
		defaultPage='home'
		fullWidthPages={['home', 'search', 'methodology', 'about', 'blog', 'privacypolicy', 'financialadvisers', 'corporates', 'terms', 'careers']}
		navbarExternalLinks={EXTERNAL_PAGE_LINKS}
		navbarChildren={<SearchWidget />}
	/>);
};

export default MainDiv;
