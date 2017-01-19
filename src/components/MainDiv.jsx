import React from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest'
const assert = SJTest.assert;
// import LoginWidget from './LoginWidget.jsx';
import printer from '../utils/printer.js';

// import {XId,yessy,uid} from '../js/util/orla-utils.js';
// import {ActionMan, Action} from '../js/plumbing/ActionMan.js';
// import ViewManager from '../js/plumbing/ViewManager.js';
import C from '../C.js';

// Temaplates
import MessageBar from './MessageBar.jsx';
import Dashboard from './Dashboard.jsx';
import Search from './Search.jsx';
import Account from './Account.jsx';
import DonateToCampaign from './DonateToCampaign.jsx';

// import LoginWidget from './LoginWidget.jsx'
const PAGES = {
    'search': Search,
    'dashboard': Dashboard,
    'account': Account,
	'campaign': DonateToCampaign
}

const TABORDER = ['dashboard', 'search']

/**
		Top-level: SoGive tabs
*/
export default React.createClass({
    getInitialState: function() {
		var hash = window.location.hash.substr(1);
		if (TABORDER.indexOf(hash) >= 0) {
			return { page: hash };
		}
        // TODO logged in? then show dashboard
		return { page: 'search' };
	},

	showTab: function(tab) {
		this.setState({ page: tab });
	},

	getTabState: function(tab) {
		return tab === this.state.page? '' :
			TABORDER.indexOf(tab) < TABORDER.indexOf(this.state.page)?
			'hide-left' : 'hide-right'
	},

	componentWillMount: function() {
	},

	componentWillUnmount: function() {
	},

	render: function() {
        const page = this.state.page;
        assert(page, this.state);
        return ( <div>
            <NavBar page={this.state.page} showTab={this.showTab} />
			<div className="container avoid-navbar">
                <MessageBar />
                <Tab page={page} />                
            </div>            
        </div>);
	}
});


const Tab = function({page}) {
	assert(page);
    const Page = PAGES[page];
    assert(Page, (page, PAGES));
	console.log("Tab", page, Page);
    return (
      <div className='slide-hide' id={page}>
        <Page />
      </div>
    );
};

const NavBar = function({page, showTab}) {
    console.log('NavBar', page);
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
                        <a className="nav-item nav-link" href="#search" onClick={ showTab.bind(null, 'search') }>Search</a></li>

					<li className={ page === 'campaign'? 'active' : '' }>
						<a className="nav-item nav-link" href="#search" onClick={ showTab.bind(null, 'campaign') }>(dummy) Donate to Campaign</a>
					</li>
                </ul>
                <AccountMenu active={ page === 'account' } onClick={ showTab.bind(null, 'account') }/>
            </div>
        </div>
    </nav>
    )
};
// ./NavBar


/*
The top-right menu
*/
var AccountMenu = React.createClass({
	componentWillMount: function() {
	},

	componentWillUnmount: function() {
	},

	logOut: function() {
	},

	render: function() {
		// const user = this.state.user;
		let name = 'Not Logged In';
		// if (user && XId.service(user.xid)!=='temp') {
		// 	name = user.name || XId.prettyName(user.xid);
		// }
		let wsname = this.state && this.state.workspace? this.state.workspace.slug : 'scratch';
		return (
			<ul id='top-right-menu' className="nav navbar-nav navbar-right">
				<li className={ 'dropdown' + (this.props.active? ' active' : '') }>
					<a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{ name } <span className="caret"></span></a>
					<ul className="dropdown-menu">            
						<li><a href="#">Account</a></li>
						<li><a><small>(workspace: { wsname })</small></a></li>
						<li role="separator" className="divider"></li>
						<li><a href="#">Log out</a></li>
					</ul>
				</li>
			</ul>
		);
	}
}); // ./AccountMenu

