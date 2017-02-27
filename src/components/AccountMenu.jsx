import React from 'react';
import { connect } from 'react-redux';
import { Nav, NavItem } from 'react-bootstrap';

import C from '../C';
import { showLoginMenu, logout } from './genericActions';
// import {XId,yessy,uid} from '../js/util/orla-utils.js';

import Misc from './Misc';


/*
The top-right menu
*/
const AccountMenu = ({user, pending, active, doLogout, showLogin}) => {
	if (pending) return <Misc.Loading />;

	if (!user) {
		return (
			<ul id='top-right-menu' className="nav navbar-nav navbar-right">
				<li>
					<a href='#' onClick={showLogin}>
						Login or Register
					</a>
				</li>
			</ul>
		);
	}

	return (
		<ul id='top-right-menu' className="nav navbar-nav navbar-right">
			<li className={'dropdown' + (active? ' active' : '')}>
				<a className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
					{ user.name || user.xid }&nbsp;
					<span className="caret" />
				</a>
				<ul className="dropdown-menu">
					<li><a href="#account">Account</a></li>
					<li role="separator" className="divider" />
					<li><a href="#dashboard" onClick={() => doLogout()}>Log out</a></li>
				</ul>
			</li>
		</ul>
	);
};

const mapStateToProps = (state, ownProps) => ({
	...ownProps,
	...state.login,
});

const mapDispatchToProps = (dispatch) => ({
	doLogout: () => dispatch(logout(dispatch)),
	showLogin: () => dispatch(showLoginMenu(true)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AccountMenu);
