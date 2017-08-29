import React, { Component } from 'react';
import Login from 'you-again';
import { assert } from 'sjtest';
import { getUrlVars } from 'wwutils';
import _ from 'lodash';

// Plumbing
import DataStore from '../../plumbing/DataStore';
import C from '../../C';
// Templates
import MessageBar from '../MessageBar';
import NavBar from '../NavBar';
import LoginWidget from '../LoginWidget/LoginWidget';
// Pages
import DashboardPage from '../DashboardPage';
import SearchPage from '../SearchPage';
import AccountPage from '../AccountPage';
import AboutPage from '../AboutPage';
import CharityPage from '../CharityPage';
import EditCharityPage from '../editor/EditCharityPage';
import EditorDashboardPage from '../editor/EditorDashboardPage';
import ExchangeRatesPage from '../editor/ExchangeRatesPage';

// Actions

const PAGES = {
	search: SearchPage,
	dashboard: DashboardPage,
	editordashboard: EditorDashboardPage,
	account: AccountPage,
	charity: CharityPage,
	edit: EditCharityPage,
	exchangeRates: ExchangeRatesPage,
	about: AboutPage
};

const DEFAULT_PAGE = 'search';


/**
		Top-level: tabs
*/
class MainDiv extends Component {
	constructor(props) {
		super(props);
		this.state = this.decodeHash(window.location.href);
	}

	componentWillMount() {
		// redraw on change
		const updateReact = (mystate) => this.setState({});
		DataStore.addListener(updateReact);

		Login.app = C.app.service;
		// Set up login watcher here, at the highest level		
		Login.change(() => {
			// ?? should we store and check for "Login was attempted" to guard this??
			if (Login.isLoggedIn()) {
				// close the login dialog on success
				DataStore.setShow(C.show.LoginWidget, false);
			} else {
				// poke React via DataStore (e.g. for Login.error)
				DataStore.update({});
			}
			this.setState({});
		});
	}

	componentDidMount() {
		window.addEventListener('hashchange', ({newURL}) => { this.hashChanged(newURL); });
	}

	componentWillUnmount() {
		window.removeEventListener('hashchange', ({newURL}) => { this.hashChanged(newURL); });
	}

	hashChanged(newURL) {
		this.setState(
			this.decodeHash(newURL)
		);
	}

	decodeHash(url) {
		// TODO use DataStore instead
		const hashIndex = url.indexOf('#');
		const hash = (hashIndex >= 0) ? url.slice(hashIndex + 1) : '';
		let page = hash.split('?')[0] || DEFAULT_PAGE;
		const pageProps = getUrlVars(hash);
		// peel off eg publisher/myblog
		const pageBits = page.split('/');
		page = pageBits[0];
		if (pageBits.length > 1) { // TODO use DataStore instead
			// store in DataStore focus
			const ptype = toTitleCase(page); // hack publisher -> Publisher
			DataStore.setValue(['focus', ptype], pageBits[1]);
		}		
		return { page, pageProps };
	}

	render() {
		let path = DataStore.getValue('location', 'path');		
		const { page, pageProps } = this.state;
		console.log("TODO page from path?", path, page);
		assert(page, this.props);
		let Page = PAGES[page];		
		assert(Page, (page, PAGES));

		let msgs = Object.values(DataStore.getValue('misc', 'messages-for-user') || {});
		return (
			<div>
				<NavBar page={page} />
				<div className="container avoid-navbar">
					<MessageBar messages={msgs} />
					<div id={page}>
						<Page {...pageProps} />
					</div>
				</div>
				<LoginWidget logo={C.app.service} title={'Welcome to '+C.app.name} />
			</div>
		);
	}
}

export default MainDiv;
