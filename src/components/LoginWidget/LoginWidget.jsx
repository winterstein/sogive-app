import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import SJTest, {assert} from 'sjtest';
import Login from 'hooru';
import { XId, uid } from 'wwutils';

import printer from '../../utils/printer.js';
import C from '../../C.js';
import Misc from '../Misc.jsx';
import { updateField } from '../genericActions';

import Cookies from 'js-cookie';

/**
		Login or Signup (one widget)
		See SigninScriptlet

*/
class LoginWidget extends React.Component {

	componentWillMount() {
	}

	componentWillUnmount() {
	}

	render() {
		const { loginDialog, verb } = this.props;
		if (Login.isLoggedIn()) {
			return <div>Signed in as { XId.dewart(Login.getId()) }</div>;
		}
		const card = (
			<div>
				<p>Please {verb} below.</p>
				<div className="row">
					<div className="email-signin col-sm-6" style={{borderRight: 'solid 2px #999'}}>				
						<EmailSignin verb={verb} setVerbReset={this.setVerbReset} setEmail={this.setEmail} 
							setPassword={this.setPassword} loginOrRegister={this.loginOrRegister} 
							doPasswordReset={this.doPasswordReset} />
					</div>
					<div className="col-sm-6">
						<SocialSignin verb={verb} services={null} />
					</div> {/* ./social sign in */}
				</div> {/* ./row */}
				<div>{verb==='register'? "Already have an account?" : "Don't yet have an account?"}
					&nbsp;<a href='#' onClick={ this.toggleVerb }>{ verb === 'register'? "Login" : "Sign-up" }</a>
				</div>
			</div>
		);
		
		if (this.props.incard) {
			return card;
		}
		return (
			<div className="container">
				<div className="panel panel-default">
					<div className="panel-heading">Welcome (back) to Orla</div>
					<div className="panel-body">
							<Misc.Logo service="sogive" size='large' transparent={false} />
							{card}
					</div> {/* ./panel-body */}
				</div>
			</div>
		);
	} // ./render()

} // ./LoginWidget


const SocialSignin = () => {
	const verb = this.props.verb;
	return (<div className="social-signin">
	<div className="form-group">
		<button onClick={ this.socialLogin.bind(null, 'twitter') } className="btn btn-default form-control">
			<Misc.Logo size='small' service='twitter' /> { verb } with Twitter
		</button>
	</div>
	<div className="form-group">
		<button onClick={ this.socialLogin.bind(null, 'facebook') } className="btn btn-default form-control">
			<Misc.Logo size="small" service="facebook" /> { verb } with Facebook
		</button>
	</div>
	<div className="form-group hidden">
		<button onClick={ this.socialLogin.bind(null, 'instagram') } className="btn btn-default form-control">
			<Misc.Logo size='small' service='instagram' /> { verb } with Instagram
		</button>
	</div>
	<p><small>SoGive will never share your data, and will never act without your consent. 
		You can read our <a href='http://sogive.org/privacy-policy.html' target="_new">privacy policy</a> for more information.
	</small></p></div>);	
};


class EmailSignin extends React.Component {

	render() {
		// reset?
		if (this.props.verb === 'reset') {
			return (
					<form id="loginByEmail">
						<div className="form-group">
							<label>Email</label>
							<input id="person_input" className="form-control" type="email" name="person" placeholder="Email"
								onChange={ this.props.setEmail } />
						</div>
						<div className="form-group">
							<button type="submit" className="btn btn-default form-control" 
									onClick={ this.props.doPasswordReset }>Send password reset</button>
						</div>
						<LoginError />
					</form>
				);			
		}
		// login/register		
		return (
				<form id="loginByEmail">
					<div className="form-group">
						<label>Email</label>
						<input id="person_input" className="form-control" type="email" name="person" placeholder="Email"
							onChange={ this.props.setEmail } />
					</div>
					<div className="form-group">
						<label>Password</label>
						<input id="password_input" className="form-control" type="password" name="password" placeholder="Password"
							onChange={ this.props.setPassword } />
					</div>
					<div className="form-group">
						<button type="submit" className="btn btn-default form-control" onClick={ this.props.loginOrRegister }>{ this.props.verb }</button>
					</div>
					<LoginError />
					<ResetLink verb={this.props.verb} setVerbReset={this.props.setVerbReset} />
				</form>
			);
	}
} // ./EmailSignin

const ResetLink = ({verb, setVerbReset}) => {	
	if (verb==='login') {
		return (<div className='pull-right'><small><a onClick={setVerbReset}>Forgotten password?</a></small></div>);
	} 
	return null;
};

const LoginError = function() {
	if ( ! Login.error) return <div></div>;
	return <div className="form-group"><div className="alert alert-danger">{ Login.error.text }</div></div>;
};




const mapStateToProps = (state, ownProps) => ({
	...ownProps,
	...state.login,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	handleLogin: (field, value) => dispatch(updateField('DONATION_FORM_UPDATE', field, value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginWidget);
