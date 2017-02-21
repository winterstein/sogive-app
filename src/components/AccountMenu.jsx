import React from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest'
const assert = SJTest.assert;
// import LoginWidget from './LoginWidget.jsx';
import printer from '../utils/printer.js';
import {getUrlVars} from 'wwutils';

// import {XId,yessy,uid} from '../js/util/orla-utils.js';
// import {ActionMan, Action} from '../js/plumbing/ActionMan.js';
// import ViewManager from '../js/plumbing/ViewManager.js';
import C from '../C.js';
import Login from 'hooru';
import {Nav,NavItem} from 'react-bootstrap';
import LoginWidget from './LoginWidget.jsx';

/*
The top-right menu
*/
export default class AccountMenu extends React.Component {
	componentWillMount() {
	}

	componentWillUnmount() {
	}

	logOut() {
	}

	render() {
        if ( ! Login.isLoggedIn()) {
			// TODO <LoginWidget />
            return (
                <Nav pullRight>
                    <NavItem eventKey={1} href="#">Login or Register</NavItem>					
                </Nav>
            );
        }
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
	} // ./render

}; // ./AccountMenu

