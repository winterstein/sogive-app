import React, { Component } from 'react';
import { connect } from 'react-redux';
import Login from 'hooru';
import { assert } from 'sjtest';
import { getUrlVars } from 'wwutils';

// Plumbing
import DataStore from '../../plumbing/DataStore';

// Templates
import MessageBar from '../MessageBar';
import SoGiveNavBar from '../SoGiveNavBar/SoGiveNavBar';
import LoginWidget from '../LoginWidget/LoginWidget';
// Pages
import DashboardPage from '../DashboardPage';
import SearchPage from '../SearchPage';
import Account from '../Account';
import DonateToCampaignPage from '../DonateToCampaignPage';
import CharityPage from '../CharityPage';

// Actions


const PAGES = {
	search: SearchPage,
	dashboard: DashboardPage,
	account: Account,
	charity: CharityPage,
	campaign: DonateToCampaignPage
};

const DEFAULT_PAGE = 'search';


/**
		Top-level: SoGive tabs
*/
class MainDiv extends Component {
	constructor(props) {
		super(props);
		this.state = this.decodeHash(window.location.href);
	}

	componentWillMount() {
		// redraw on change
		DataStore.addListener((mystate) => this.setState({}));

		// Set up login watcher here, at the highest level
		Login.change(() => {
			this.setState({});
		});
	}

	componentWillMount() {
		// poke react on change
		DataStore.addListener(() => this.setState({}));
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
		const hashIndex = url.indexOf('#');
		const hash = (hashIndex >= 0) ? url.slice(hashIndex + 1) : '';
		const page = hash.split('?')[0] || DEFAULT_PAGE;
		const pageProps = getUrlVars(hash);
		return { page, pageProps };
	}

	render() {
		const { page, pageProps } = this.state;
		assert(page, this.props);
		const Page = PAGES[page];
		assert(Page, (page, PAGES));

		return (
			<div>
				<SoGiveNavBar page={page} />
				<div className="container avoid-navbar">
					<MessageBar />
					<div id={page}>
						<Page {...pageProps} />
					</div>
				</div>
				<LoginWidget logo='sogive' title='Welcome to SoGive' />
			</div>
		);
	}
}

/* connect() with no second argument (normally mapDispatchToProps)
 * makes dispatch itself available as a prop of MainDiv
 */
export default connect()(MainDiv);
