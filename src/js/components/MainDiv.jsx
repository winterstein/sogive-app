import React, { Component } from 'react';
import Login from 'you-again';
import { assert } from 'sjtest';
import { getUrlVars, toTitleCase, modifyHash } from 'wwutils';
import _ from 'lodash';

// Plumbing
import DataStore from '../base/plumbing/DataStore';
import Roles from '../base/Roles';
import C from '../C';
// Templates
import MessageBar from '../base/components/MessageBar';
import NavBar from '../base/components/NavBar';
import LoginWidget from '../base/components/LoginWidget';
// Pages
import DashboardPage from './DashboardPage';
import GardenPage from './GardenPage';
import FossilPage from './FossilPage';
import AccountPage from '../base/components/AccountPageWidgets';
import AboutPage from '../base/components/AboutPage';
import E404Page from '../base/components/E404Page';
import TestPage from '../base/components/TestPage';

/**
 * init DataStore
 */
DataStore.update({
	data: {
		User: {},
		Sprite: {}
	},
	game: {
		tick: 0
	},
	// Use list to store search results
	list: {

	},
	focus: {
		NGO: null,
		User: null,
	},	
	widget: {},
	misc: {
	},
	/** status of server requests, for displaying 'loading' spinners 
	 * Normally: transient.$item_id.status
	*/
	transient: {}
});


const PAGES = {
	dashboard: DashboardPage,
	account: AccountPage,
	garden: GardenPage,
	fossil: FossilPage,
	about: AboutPage,
	test: TestPage	
};

const DEFAULT_PAGE = 'garden';

/**
		Top-level: tabs
*/
class MainDiv extends Component {

	componentWillMount() {
		// redraw on change
		const updateReact = (mystate) => this.setState({});
		DataStore.addListener(updateReact);

		Login.app = C.app.service;
		// Set up login watcher here, at the highest level		
		Login.change(() => {
			// invalidate all lists!
			DataStore.setValue(['list'], {});
			// also remove any promises for these lists -- see fetch()		
			let ppath = ['transient', 'PromiseValue', 'list'];
			DataStore.setValue(ppath, null);

			// ?? should we store and check for "Login was attempted" to guard this??
			if (Login.isLoggedIn()) {
				// close the login dialog on success
				LoginWidget.hide();
			} else {
				// poke React via DataStore (e.g. for Login.error)
				DataStore.update({}); // is this needed given the setState() below??
			}
			this.setState({});
		});

		// Are we logged in?
		Login.verify();

		// enforce a page
		let path = DataStore.getValue('location', 'path');
		let page = (path && path[0]);
		if ( ! page) {
			modifyHash([DEFAULT_PAGE]);
		}
	}

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({error, info, errorPath: DataStore.getValue('location', 'path')});
		console.error(error, info); 
		if (window.onerror) window.onerror("Caught error", null, null, null, error);
	}

	render() {
		// HACK clear render info
		DataStore.setValue(['transient', 'render'], null, false);	

		let path = DataStore.getValue('location', 'path');	
		let page = (path && path[0]);
		if ( ! page) {
			page = DEFAULT_PAGE;
			console.warn("MainDiv.jsx - No page?! in render() - using default "+DEFAULT_PAGE);
		}
		assert(page);
		let Page = PAGES[page];		
		if ( ! Page) {
			Page = E404Page;
		}
		// caught an error?
		if (this.state && this.state.error && this.state.errorPath === path) {
			// Page is an error function
			Page = () => (
				<div><h3>There was an Error :'(</h3>
					<p>Try navigating to a different tab, or reloading the page. If this problem persists, please contact support.</p>
					<p>{this.state.error.message}<br/><small>{this.state.error.stack}</small></p>
				</div>);
		}
		// which pages?
		let pages = ['dashboard', 'search'];
		if (Roles.iCan(C.CAN.test).value) { // TODO for everyone, not just dev
			pages = pages.concat(['event', 'fundraiser']);
		}
		
		let msgs = Object.values(DataStore.getValue('misc', 'messages-for-user') || {});
		return (
			<div>
				<NavBar page={page} pages={pages} />
				<div className="container avoid-navbar">
					<MessageBar messages={msgs} />
					<div className='page' id={page}>
						<Page />
					</div>
				</div>
				<LoginWidget logo={C.app.service} title={'Welcome to '+C.app.name} />
			</div>
		);
	} // ./render()
} // ./MainDiv

export default MainDiv;
