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
		this.state = { pageProps };
	}

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	showTab(tab) {
		this.setState({ page: tab });
	}

	render() {
		const { page } = this.props;
		const { pageProps } = this.state;
		assert(page, this.props);
		return (
			<div>
				<SoGiveNavBar />
				<div className="container avoid-navbar">
					<MessageBar />
					<Tab page={page} pageProps={pageProps} />
				</div>
			</div>
		);
	}
}

/**
 * This function maps parts of the Redux central state object onto the component's props.
 * We can use deep refs like state.navigation.previousTab...
 * ...and we can use dynamic refs like state.xids[ownProps.user].bio
 * We can also disregard the supplied props by omitting ownProps.
 */
const mapStateToProps = (state, ownProps) => ({
	...ownProps,
	page: state.navigation.page,
});

export default connect(
  mapStateToProps,
)(MainDiv);

