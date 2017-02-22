import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import AccountMenu from '../AccountMenu';
import { switchPage } from './SoGiveNavBar-actions';

// import { Nav, NavBar, NavItem } from 'react-bootstrap';
// https://react-bootstrap.github.io/components.html#navbars
// 	return (
// 			<NavBar inverse defaultExpanded>
// 					<NavBar.Header>
// 							<NavBar.Brand><a href="#"><img style={{maxWidth:'100px',maxHeight:'50px',background:'black'}} src="img/logo.png" /></a></NavBar.Brand>
// 							<Navbar.Toggle />
// 					</NavBar.Header>
// 					<Navbar.Collapse>
// 					<Nav>
// 							<NavBar.Brand><a href="#"><img style={{maxWidth:'100px',maxHeight:'50px',background:'black'}} src="img/logo.png" /></a></NavBar.Brand>
// 							<NavItem eventKey={1} href="#">Link</NavItem>
// 							<NavItem eventKey={2} href="#">Link</NavItem>
// 					</Nav>
// 					<Nav pullRight>
// 							<NavItem eventKey={1} href="#">Link Right</NavItem>
// 							<NavItem eventKey={2} href="#">Link Right</NavItem>
// 					</Nav>
// 					</Navbar.Collapse>
// 			</NavBar>
// 	);

const SoGiveNavBar = ({page, handleSwitchPage}) => {
	console.log('NavBar', page);

	return (
		<nav className="navbar navbar-fixed-top navbar-inverse">
			<div className="container">
				<div className="navbar-header" title="Dashbrd">
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
					<a className="navbar-brand" href="#dashboard">
						<img alt="SoGive logo" style={{maxWidth:'100px',maxHeight:'50px',background:'black'}} src="img/logo.png" />
					</a>
				</div>
				<div id="navbar" className="navbar-collapse collapse">
					<ul className="nav navbar-nav">
						<li className={page === 'dashboard'? 'active' : ''}>
							<a className="nav-item nav-link" href="#dashboard" onClick={() => handleSwitchPage('dashboard')}>
								My Profile
							</a></li>
						<li className={page === 'search'? 'active' : ''}>
							<a className="nav-item nav-link" href="#search" onClick={() => handleSwitchPage('search')}>
								Search
							</a></li>
						<li className={page === 'charity'? 'active' : ''}>
							<a className="nav-item nav-link" href="#charity" onClick={() => handleSwitchPage('charity')}>
								(dummy) Charity
							</a>
						</li>
					</ul>
					<AccountMenu active={page === 'account'} onClick={() => handleSwitchPage('account')} />
				</div>
			</div>
		</nav>
	);
};
// ./NavBar

SoGiveNavBar.propTypes = {
	page: PropTypes.string.isRequired,
	handleSwitchPage: PropTypes.func.isRequired,
};


const mapStateToProps = (state, ownProps) => ({
	...ownProps,
	page: state.navigation.page,
});

const mapDispatchToProps = (dispatch) => ({
handleSwitchPage: (value) => dispatch(switchPage(value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SoGiveNavBar);
