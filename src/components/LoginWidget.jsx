import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import C from '../C.js';
import Cookies from 'js-cookie';
import LoginIO from 'hooru';
import Misc from './Misc.jsx';

/**
		Login or Signup (one widget)
		See SigninScriptlet

*/
class LoginWidget extends React.Component {

	constructor(...params) {
		super(...params);
		this.state = {
			action: 'register',
			email: '',
			password: ''
		};
	}

	componentWillMount() {
			// ViewManager.register(C.stateKey.login, this, 'loginState');
	}

	componentWillUnmount() {
			// ViewManager.unregister(C.stateKey.login, this);
	}

	setLoading(isLoading) {
			console.warn('setLoading', isLoading);
			this.setState({'loading':isLoading});
	}

	setEmail(event) {
		if ( ! event) {
			// Why does jquery call this?!
			console.log("LoginWidget.jsx setEmail() WTF?",event,this, this.state);
			return;
		}
		this.setState({ email: event.target.value });
	}

	setPassword(event) {
		if ( ! event) return;
		this.setState({ password: event.target.value });
	}

	loginOrRegister(event) {
		// This "should" be in the scriptlet. But it is fine here.
		if ( ! event) {
			console.log("LoginWidget.jsx loginOrRegister() WTF?",event,this, this.state);
			return;
		}
		event.preventDefault();
		if (this.state.action==='login') {
			ActionMan.perform(new Action(this, C.action.login, this.state))
			.always(function(){
				console.warn("Login.error", LoginIO.error);
				this.setState({}); // re-render 'cos Login.error can change without an update
			}.bind(this));
		} else {
			assert(this.state.action==='register', this.state);
			ActionMan.perform(new Action(this, C.action.signUp, this.state))
			.always(function(){
				console.warn("Login.error", LoginIO.error);
				this.setState({}); // re-render 'cos Login.error can change without an update
			}.bind(this));
		}
	}

	doPasswordReset(event) {
		event.preventDefault();
		assert(this.state.email, "No email entered to do a password reset");
		LoginIO.reset(this.state.email);
	}
	
	toggleVerb(service) {
		const otherverb = this.state.action==='login'? 'register' : 'login';
		this.setState({action: otherverb});
	}

	setVerbReset() {
		this.setState({action: 'reset'});
	}

	render() {
		if (LoginIO.isLoggedIn()) {
			return <div>Signed in as { XId.dewart(LoginIO.getId()) }</div>;
		}
		// TODO s/verb/action/ NB: verb upsets ActionMan
		const verb = this.state.action;
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
							<Misc.Logo service="sogive" size='large' />
							{card}
					</div> {/* ./panel-body */}
				</div>
			</div>
		);
	} // ./render()

} // ./LoginWidget
export default LoginWidget;


const SocialSignin = React.createClass({
	
	socialLogin: function(service) {
		ActionMan.perform(new Action(this, C.action.socialLogin, { service: service }));
	},

	render: function() {
		const verb = this.props.verb;
		return (<div className="social-signin">
		<div className="form-group">
			<button onClick={ this.socialLogin.bind(null, 'twitter') } className="btn btn-default form-control">
				<Misc.Logo size='small' service='twitter' /> { verb } with Twitter
			</button>
		</div>
		<div className="form-group hidden">
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
	}

});


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
	if ( ! LoginIO.error) return <div></div>;
	return <div className="form-group"><div className="alert alert-danger">{ LoginIO.error.text }</div></div>;
};
