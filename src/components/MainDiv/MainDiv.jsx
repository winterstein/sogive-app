import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import SJTest from 'sjtest';

// import LoginWidget from './LoginWidget.jsx';
// import printer from '../../utils/printer.js';
import { getUrlVars } from 'wwutils';

// import {XId,yessy,uid} from '../js/util/orla-utils.js';
// import C from '../../C.js';

// Templates
import MessageBar from '../MessageBar';
import SoGiveNavBar from '../SoGiveNavBar';
// Pages
import DashboardPage from '../DashboardPage';
import SearchPage from '../SearchPage';
import Account from '../Account';
import DonateToCampaignPage from '../DonateToCampaignPage';
import CharityPage from '../CharityPage';

const assert = SJTest.assert;

// import LoginWidget from './LoginWidget.jsx'
const PAGES = {
	search: SearchPage,
	dashboard: DashboardPage,
	account: Account,
	charity: CharityPage,
	campaign: DonateToCampaignPage
};

const DEFAULT_PAGE = 'dashboard';

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

Tab.propTypes = {
	page: PropTypes.string.isRequired,
	pageProps: PropTypes.shape({}).isRequired,
};

/**
		Top-level: SoGive tabs
*/
class MainDiv extends Component {
	constructor() {
		super();
		const pageProps = getUrlVars();
		// FIXME
		pageProps.charityId = 'solar-aid';
		this.state = this.decodeHash(window.location.href);
	}

	componentWillMount() {
		window.addEventListener('hashchange', ({newURL}) => { this.hashChanged(newURL); });
	}

	componentWillUnmount() {
		window.removeEventListener('hashchange', ({newURL}) => { this.hashChanged(newURL); });
	}

	hashChanged(newURL) {
		this.setState(this.decodeHash(newURL));
	}

	decodeHash(url) {
		const hashIndex = url.indexOf('#');
		const hash = (hashIndex >= 0) ? url.slice(hashIndex + 1) : '';
		const page = hash.split('?')[0] || DEFAULT_PAGE;
		const pageProps = getUrlVars(hash);
		return { page, pageProps };
	}

	render() {
		const { page, pageProps } = this.state;
		assert(page, this.props);
		return (
			<div>
				<SoGiveNavBar page={page} />
				<div className="container avoid-navbar">
					<MessageBar />
					<Tab page={page} pageProps={pageProps} />
				</div>
			</div>
		);
	}
}

export default MainDiv;
