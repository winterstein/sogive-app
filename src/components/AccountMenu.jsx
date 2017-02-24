import React from 'react';
import { connect } from 'react-redux';
import { Nav, NavItem } from 'react-bootstrap';

import C from '../C';
import { logout } from './genericActions';
import { openLoginMenu } from './AccountMenu-actions';
// import {XId,yessy,uid} from '../js/util/orla-utils.js';

import Misc from './Misc';


/*
The top-right menu
*/
const AccountMenu = ({user, pending, active, dispatch}) => {
	if (pending) return <Misc.Loading />;

	if (!user) {
		return (
			<Nav pullRight>
				<NavItem eventKey={1} href="#">Login or Register</NavItem>
			</Nav>
		);
	}

	return (
		<ul id='top-right-menu' className="nav navbar-nav navbar-right">
			<li className={'dropdown' + (active? ' active' : '')}>
				<span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
					{ user.name || user.xid }
					<span className="caret" />
				</span>
				<ul className="dropdown-menu">
					<li><a href="#account">Account</a></li>
					<li role="separator" className="divider" />
					<li><a href="#dashboard" onClick={() => logout(dispatch)}>Log out</a></li>
				</ul>
			</li>
		</ul>
	);
};

const mapStateToProps = (state, ownProps) => ({
	...ownProps,
	...state.login,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	doLogout: () => logout(dispatch),
	openMenu: () => dispatch()
});

export default connect(mapStateToProps)(AccountMenu);
