import { React, Component } from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest';

// import LoginWidget from './LoginWidget.jsx';
import printer from '../utils/printer.js';
import {getUrlVars} from 'wwutils';

// import {XId,yessy,uid} from '../js/util/orla-utils.js';
// import {ActionMan, Action} from '../js/plumbing/ActionMan.js';
// import ViewManager from '../js/plumbing/ViewManager.js';
import C from '../C.js';

// Temaplates
import MessageBar from './MessageBar.jsx';
import DashboardPage from './DashboardPage.jsx';
import SearchPage from './SearchPage.jsx';
import Account from './Account.jsx';
import DonateToCampaignPage from './DonateToCampaignPage.jsx';
import AccountMenu from './AccountMenu.jsx';
import { Nav, NavBar, NavItem } from 'react-bootstrap';

import { connect } from 'react-redux';

const assert = SJTest.assert;

// import LoginWidget from './LoginWidget.jsx'
const PAGES = {
	search: SearchPage,
	dashboard: DashboardPage,
	account: Account,
	campaign: DonateToCampaignPage
};

const TABORDER = ['dashboard', 'search'];

/**
		Top-level: SoGive tabs
*/
class MainDiv extends Component {
	static propTypes = {
		data: PropTypes.object,
		component: PropTypes.object,
		setListener: PropTypes.function.isRequired,
		removeListener: PropTypes.function.isRequired,
	};


	getInitialState() {
		let page;
		let hash = window.location.hash.substr(1);
		if (hash.indexOf('?') !== -1) hash = hash.substr(0, hash.indexOf('?')); 
		if (TABORDER.indexOf(hash) >= 0) {
			page = hash;
		} else {
		// TODO logged in? then show dashboard
			page = 'search';
		}
		const webProps = getUrlVars();
		// FIXME
		webProps.charityId = 'solar-aid';
		const istate = {
			page: page,
			pageProps: webProps
		};
		console.log("initstate", istate);
		return istate;
	}

	showTab(tab) {
		this.setState({ page: tab });
	}

	getTabState(tab) {
		if (tab === this.state.page) return '';
		return TABORDER.indexOf(tab) < TABORDER.indexOf(this.state.page)?
			'hide-left' : 'hide-right';
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	render() {
		const page = this.state.page;
		assert(page, this.state);
		return ( <div>
			<SoGiveNavBar page={this.state.page} showTab={this.showTab} />
			<div className="container avoid-navbar">
				<MessageBar />
				<Tab page={page} pageProps={this.state.pageProps} />
			</div>            
		</div>);
	}
}


const Tab = function({page, pageProps}) {
	assert(page);
	const Page = PAGES[page];
	assert(Page, (page, PAGES));
	console.log("Tab", page, Page);
	return (
		<div className="slide-hide" id={page}>
			<Page {...pageProps} />
		</div>
	);
};



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainDiv);