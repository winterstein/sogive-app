import React from 'react';
import { assert, assMatch } from 'sjtest';
import Login from 'hooru';
import {Modal} from 'react-bootstrap';
import { XId, uid } from 'wwutils';
import Cookies from 'js-cookie';
import DataStore from '../../plumbing/DataStore';
import ActionMan from '../../plumbing/ActionMan';
import Misc from '../Misc';
import C from '../../C';

// For testing
// Login.ENDPOINT = 'http://local.soda.sh/hooru.json';

/**
	TODO:
	- doEmailLogin(email, password) and doSocialLogin(service) are available as props now
	- Use them in the appropriate section of the form
*/

/*
const SocialSignin = ({verb, socialLogin}) => {
	return (
		<div className="social-signin">
			<div className="form-group">
				<button onClick={() => ActionMan.socialLogin('twitter')} className="btn btn-default form-control">
					<Misc.Logo size='small' service='twitter' /> { verb } with Twitter
				</button>
			</div>
			<div className="form-group">
				<button onClick={() => ActionMan.socialLogin('facebook')} className="btn btn-default form-control">
					<Misc.Logo size="small" service="facebook" /> { verb } with Facebook
				</button>
			</div>
			<div className="form-group hidden">
				<button onClick={() => ActionMan.socialLogin('instagram')} className="btn btn-default form-control">
					<Misc.Logo size='small' service='instagram' /> { verb } with Instagram
				</button>
			</div>
			<p><small>Good-Loop will never share your data, and will never post to  social media without your consent.
				You can read our <a href='https://good-loop.com/privacy-policy.html' target="_new">privacy policy</a> for more information.
			</small></p>
		</div>
	);
};*/

const emailLogin = (email, password) => {
	assMatch(email, String, password, String);
	Login.login(email, password)
	.then(function(res) {
		console.warn("login", res);
		// poke React
		DataStore.update({});	
	});
};


const EmailSignin = ({verb}) => {
	let person = DataStore.appstate.data.User.loggingIn;	

	const doItFn = () => {
		if ( ! person) {
			Login.error = {text: "Please fill in email and password"};
			return;
		}
		let e = person.email;
		let p = person.password;
		emailLogin(e, p);
	};	

	const buttonText = {
		login: 'Log in',
		register: 'Register',
		reset: 'Reset password',
	}[verb];

	// login/register
	let path = ['data', C.TYPES.User, 'loggingIn'];
	return (
		<form
			id="loginByEmail"
			onSubmit={(event) => {
				event.preventDefault();
				doItFn();
			}}
		>
			<div className="form-group">
				<label>Email</label>
				<Misc.PropControl type='email' path={path} item={person} prop='email' />
			</div>
			<div className="form-group">
				<label>Password</label>
				<Misc.PropControl type='password' path={path} item={person} prop='password' />
			</div>
			<div className="form-group">
				<button type="submit" className="btn btn-default form-control" >
					{ buttonText }
				</button>
			</div>
			<LoginError />
			{ /* <ResetLink verb={verb} setVerbReset={() => handleChange('verb', 'reset')} /> */}
		</form>
	);
}; // ./EmailSignin

const ResetLink = ({verb, setVerbReset}) => {
	if (verb === 'login') {
		return (
			<div className='pull-right'>
				<small>
					<a onClick={setVerbReset}>Forgotten password?</a>
				</small>
			</div>
		);
	}
	return null;
};

const LoginError = function() {
	if ( ! Login.error) return <div />;
	return (
		<div className="form-group">
			<div className="alert alert-danger">{ Login.error.text }</div>
		</div>
	);
};


/**
		Login or Signup (one widget)
		See SigninScriptlet

*/
const LoginWidget = ({showDialog, logo, title}) => {
	if (showDialog === undefined) {
		showDialog = DataStore.getShow('LoginWidget');
		// NB: the app is shown regardless
	}
	let verb = DataStore.appstate.widget && DataStore.appstate.widget.LoginWidget && DataStore.appstate.widget.LoginWidget.verb;
	if ( ! verb) verb = 'login';

	if ( ! title) title = `Welcome ${verb==='login'? '(back)' : ''} to the Good-Loop Portal`;

	const heading = {
		login: 'Log In',
		register: 'Register',
		reset: 'Reset Password'
	}[verb];
	
				/*<div className="col-sm-6">
							<SocialSignin verb={verb} services={null} />
						</div>*/
	return (
		<Modal show={showDialog} className="login-modal" onHide={() => DataStore.setShow(C.show.LoginWidget, false)}>
			<Modal.Header closeButton>
				<Modal.Title>
					<Misc.Logo service={logo} size='large' transparent={false} />
					{title}					
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="container-fluid">
					<div className="row">
						<div className="col-sm-12">
							<EmailSignin
								verb={verb}
							/>
						</div>
					</div>
				</div>
			</Modal.Body>
			<Modal.Footer>
			{
				verb === 'register' ?
					<div>
						Already have an account?
						&nbsp;<a href='#' onClick={() => DataStore.setValue(['widget','LoginWidget','verb'], 'login')} >Login</a>
					</div> :
					<div>
						Don&#39;t yet have an account?
						&nbsp;<a href='#' onClick={() => DataStore.setValue(['widget','LoginWidget','verb'], 'register')} >Register</a>
					</div>
			}
			</Modal.Footer>
		</Modal>
	);
}; // ./LoginWidget


export default LoginWidget;
