import { React, Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import SJTest from 'sjtest';

// import LoginWidget from './LoginWidget.jsx';
// import printer from '../../utils/printer.js';
import {getUrlVars} from 'wwutils';

// import {XId,yessy,uid} from '../js/util/orla-utils.js';
// import C from '../../C.js';

// Templates
import MessageBar from '../MessageBar.jsx';
import DashboardPage from '../DashboardPage.jsx';
import SearchPage from '../SearchPage.jsx';
import Account from '../Account.jsx';
import DonateToCampaignPage from '../DonateToCampaignPage.jsx';
import SoGiveNavBar from '../SoGiveNavBar';


const assert = SJTest.assert;

// import LoginWidget from './LoginWidget.jsx'
const PAGES = {
	search: SearchPage,
	dashboard: DashboardPage,
	account: Account,
	campaign: DonateToCampaignPage
};

const TABORDER = ['dashboard', 'search'];

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
	pageProps: PropTypes.object.isRequired,
};

/**
		Top-level: SoGive tabs
*/
class MainDiv extends Component {
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

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	showTab(tab) {
		this.setState({ page: tab });
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

/**
 * This function maps parts of the Redux central state object onto the component's props.
 * We can use deep refs like state.navigation.previousTab...
 * ...and we can use dynamic refs like state.xids[ownProps.user].bio
 * We can also disregard the supplied props by omitting ownProps.
 */
const MapStateToProps = (state, ownProps) => ({
	...ownProps,
	page: state.navigation.page,
});

const mapDispatchToProps = (dispatch, ownProps) => ({

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainDiv);

