import React from 'react';

import AccountMenu from './AccountMenu';
import C from '../C';
import Roles from '../base/Roles';

/**
 * 
 * @param {*} page The current page
 */
const NavBar = ({currentPage}) => {
	// which pages?
	let pages = ['dashboard', 'search'];
	if (Roles.iCan(C.CAN.test).value) { // TODO for everyone, not just dev
		pages = pages.concat(['event', 'fundraiser']);
	}
	// make the page links
	let pageLinks = pages.map( p => <NavLink currentPage={currentPage} targetPage={p} key={'li_'+p} /> );
	return (
		<nav className="navbar navbar-fixed-top navbar-inverse">
			<div className="container">
				<div className="navbar-header" title="Dashboard">
					<button
						type="button"
						className="navbar-toggle collapsed"
						data-toggle="collapse"
						data-target="#navbar"
						aria-expanded="false"
						aria-controls="navbar"
					>
						<span className="sr-only">Toggle navigation</span>
						<span className="icon-bar" />
						<span className="icon-bar" />
						<span className="icon-bar" />
					</button>
					<a className="" href="#dashboard">
						<img alt="SoGive logo" src="img/logo-white-sm.png" />
					</a>
				</div>
				<div id="navbar" className="navbar-collapse collapse">
					<ul className="nav navbar-nav">
						{pageLinks}
					</ul>
					<div>
						<AccountMenu active={currentPage === 'account'} />
					</div>
				</div>
			</div>
		</nav>
	);
};
// ./NavBar


// NB: the react-bootstrap version of this with Navbar, NavItem seems to have bugs in NavItem's handling of clicks :'(
// ...yep, react-bootstrap's navbar has been broken for a year https://github.com/react-bootstrap/react-bootstrap/issues/2365
// So we solve ourselves, with a custom on-click
const navClick = (e) => {
	// close the menu in mobile mode
	let openMobileMenu = $('#navbar.collapse.in');
	if (openMobileMenu.length) {
		console.warn("better close it!")
		$('button.navbar-toggle').click();
	}
};
const NavLink = ({currentPage, targetPage}) => {
	return (<li className={currentPage === targetPage? 'active' : ''}>
				<a className="nav-item nav-link" href={'#'+targetPage} onClick={navClick} >
					{targetPage}
				</a>
			</li>);
};

export default NavBar;
