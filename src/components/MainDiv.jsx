import React, { Component } from 'react';
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
import CharityPage from './CharityPage.jsx';
import Account from './Account.jsx';
import DonateToCampaignPage from './DonateToCampaignPage.jsx';
import AccountMenu from './AccountMenu.jsx';
import { Nav, NavBar, NavItem } from 'react-bootstrap';

import { connect } from 'react-redux';

const assert = SJTest.assert;

// import LoginWidget from './LoginWidget.jsx'
const PAGES = {
	'search': SearchPage,
	'dashboard': DashboardPage,
	'account': Account,
	'charity': CharityPage,
	'campaign': DonateToCampaignPage
}

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
		if (PAGES[hash]) {
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

const SoGiveNavBar = function({page, showTab}) {
    console.log('NavBar', page);
// https://react-bootstrap.github.io/components.html#navbars
    // return (
    //     <NavBar inverse defaultExpanded>
    //         <NavBar.Header>
    //             <NavBar.Brand><a href="#"><img style={{maxWidth:'100px',maxHeight:'50px',background:'black'}} src="img/logo.png" /></a></NavBar.Brand>            
    //             <Navbar.Toggle />
    //         </NavBar.Header>
    //         <Navbar.Collapse>
    //         <Nav>
    //             <NavBar.Brand><a href="#"><img style={{maxWidth:'100px',maxHeight:'50px',background:'black'}} src="img/logo.png" /></a></NavBar.Brand>
    //             <NavItem eventKey={1} href="#">Link</NavItem>
    //             <NavItem eventKey={2} href="#">Link</NavItem>
    //         </Nav>
    //         <Nav pullRight>
    //             <NavItem eventKey={1} href="#">Link Right</NavItem>
    //             <NavItem eventKey={2} href="#">Link Right</NavItem>
    //         </Nav>
    //         </Navbar.Collapse>
    //     </NavBar>
    // );
    return (
    <nav className="navbar navbar-fixed-top navbar-inverse">
        <div className="container">
            <div className="navbar-header" title="Dashbrd">
                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                </button>
                <a className="navbar-brand" href="#"><img style={{maxWidth:'100px',maxHeight:'50px',background:'black'}} src="img/logo.png" /></a>
            </div>
            <div id="navbar" className="navbar-collapse collapse">
                <ul className="nav navbar-nav">
                    <li className={ page === 'dashboard'? 'active' : '' }>
                        <a className="nav-item nav-link" href="#dashboard" onClick={ showTab.bind(null, 'dashboard') }>My Profile</a></li>
                    <li className={ page === 'search'? 'active' : '' }>
                        <a className="nav-item nav-link" href="#search" onClick={ showTab.bind(null, 'search') }>Search</a>
					</li>
					<li className={ page === 'charity'? 'active' : '' }>
						<a className="nav-item nav-link" href="#charity" onClick={ showTab.bind(null, 'charity') }>(dummy) Charity</a>
					</li>
					<li className={ page === 'campaign'? 'active' : '' }>
						<a className="nav-item nav-link" href="#search" onClick={ showTab.bind(null, 'campaign') }>(dummy) Campaign</a>
					</li>
                </ul>
                <AccountMenu active={ page === 'account' } onClick={ showTab.bind(null, 'account') }/>
            </div>
        </div>
    </nav>
    );
};
// ./NavBar

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainDiv);