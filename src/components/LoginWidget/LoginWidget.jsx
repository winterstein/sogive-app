import React from 'react';
import { assert, assMatch } from 'sjtest';
import Login from 'you-again';
import {Modal} from 'react-bootstrap';
import { XId, uid, stopEvent, toTitleCase} from 'wwutils';
import Cookies from 'js-cookie';
import DataStore from '../../plumbing/DataStore';
import ActionMan from '../../plumbing/ActionMan';
import {Logo, PropControl} from '../Misc';
import C from '../../C';

// For testing
if ( (""+window.location).indexOf('login=local') !== -1) {	
	Login.ENDPOINT = 'http://localyouagain.winterwell.com/youagain.json';
	console.warn("config", "Set you-again Login endpoint to "+Login.ENDPOINT);
}

/**
	TODO:
	- doEmailLogin(email, password) and doSocialLogin(service) are available as props now
	- Use them in the appropriate section of the form
*/

const STATUS_PATH = ['widget', C.show.LoginWidget, 'status'];

const LoginLink = () => {
	return (<a href={window.location} onClick={ e => { e.preventDefault(); e.stopPropagation(); DataStore.setShow(C.show.LoginWidget, true); } } >
		Login or Register
	</a>);
};

const canSignIn = {
	facebook: true,
	instagram: true,
	twitter: true,
};

const SocialSignin = ({verb, services}) => {
	if (verb === 'reset') return null;
	if ( ! services) {
		return null; 
	}
	return (
		<div className="social-signin">
			{ services.map(service => <SocialSignInButton service={service} verb={verb} key={service} />)}
			<p><small>We will never share your data or post to social media without your consent.
				You can read our <a href='https://sogive.org/privacy-policy.html' target="_new">privacy policy</a> for more information.
			</small></p>
		</div>
	);
};

const SocialSignInButton = ({ service, verb}) => {
	if (!canSignIn[service]) return null;

	return (
		<div className='form-group'>
			<button onClick={() => socialLogin(service)} className="btn btn-default signin">
				<Logo size='small' service={service} bgcolor /> <span>{toTitleCase(verb)} with {toTitleCase(service)}</span>
			</button>
		</div>
	);
};


const socialLogin = (service) => {
	Login.auth(service, C.app.facebookAppId);
	// auth doesnt return a future, so rely on Login's change listener
	// to close stuff.
}; // ./socialLogin


const emailLogin = ({verb, app, email, password}) => {
	assMatch(email, String, password, String);
	let call = verb==='register'?
		Login.register({email:email, password:password})
		: Login.login(email, password);
	
	DataStore.setValue(STATUS_PATH, C.STATUS.loading);

	call.then(function(res) {
		console.warn("login", res);
		DataStore.setValue(STATUS_PATH, C.STATUS.clean);
		if (Login.isLoggedIn()) {
			// close the dialog on success
			DataStore.setShow(C.show.LoginWidget, false);
		} else {
			// poke React via DataStore (e.g. for Login.error)
			DataStore.update({});
		}
	}, err => {
		DataStore.setValue(STATUS_PATH, C.STATUS.clean);
	});
};

const EmailSignin = ({verb, onLogin}) => {
	// we need a place to stash form info. Maybe appstate.widget.LoginWidget.name etc would be better?
	let person = DataStore.appstate.data.User.loggingIn;	

	const doItFn = () => {
		if ( ! person) {
			Login.error = {text: "Please fill in email and password"};
			return;
		}
		let e = person.email;
		let p = person.password;
		if (verb==='reset') {
			assMatch(e, String);
			let call = Login.reset(e)
				.then(function(res) {
					if (res.success) {
						DataStore.setValue(['widget', C.show.LoginWidget, 'reset-requested'], true);
						if (onLogin) onLogin(res);
					} else {
						// poke React via DataStore (for Login.error)
						DataStore.update({});
					}
				});
			return;
		}
		emailLogin({verb, ...person});
	};

	const buttonText = {
		login: 'Log in',
		register: 'Register',
		reset: 'Reset password',
	}[verb];

	// login/register
	let path = ['data', C.TYPES.User, 'loggingIn'];
	let status = DataStore.getValue(STATUS_PATH);
	return (
		<form
			id="loginByEmail"
			onSubmit={(event) => {
				event.preventDefault();
				doItFn();
			}}
		>
			{verb==='reset'? <p>Forgotten your password? No problem - we will email you a link to reset it.</p> : null}
			<div className="form-group">
				<label>Email</label>
				<PropControl type='email' path={path} item={person} prop='email' />
			</div>
			{verb==='reset'? null : <div className="form-group">
				<label>Password</label>
				<PropControl type='password' path={path} item={person} prop='password' />
			</div>}
			{verb==='reset' && DataStore.getValue('widget', C.show.LoginWidget, 'reset-requested')? <div className="alert alert-info">A password reset email has been sent out.</div> : null}
			<div className="form-group">
				<button type="submit" className="btn btn-primary form-control" disabled={C.STATUS.isloading(status)}>
					{ buttonText }
				</button>
			</div>
			<LoginError />
			<ResetLink verb={verb} />
		</form>
	);
}; // ./EmailSignin

const verbPath = ['widget',C.show.LoginWidget,'verb'];

const ResetLink = ({verb}) => {
	if (verb !== 'login') return null;
	const toReset = () => {
		// clear any error from a failed login
		Login.error = null;
		DataStore.setValue(verbPath, 'reset');
	};
	return (
		<div className='pull-right'>
			<small>
				<a onClick={toReset}>Forgotten password?</a>
			</small>
		</div>
	);
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
const LoginWidget = ({showDialog, logo, title, services}) => {
	if (showDialog === undefined) {
		showDialog = DataStore.getShow('LoginWidget');
		// NB: the app is shown regardless
	}
	if ( ! services) services = ['twitter', 'facebook'];
	let verb = DataStore.getValue(verbPath) || 'login';

	if ( ! title) title = `Welcome ${verb==='login'? '(back)' : ''} to {C.app.name}`;

	const heading = {
		login: 'Log In',
		register: 'Register',
		reset: 'Reset Password'
	}[verb];

	return (
		<Modal show={showDialog} className="login-modal" onHide={() => DataStore.setShow(C.show.LoginWidget, false)}>
			<Modal.Header closeButton>
				<Modal.Title>
					<Logo service={logo} size='large' transparent={false} />
					{title}					
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<LoginWidgetGuts services={services} />
			</Modal.Body>
			<Modal.Footer>
				<SwitchVerb />
			</Modal.Footer>
		</Modal>
	);
}; // ./LoginWidget


const LoginWidgetEmbed = ({services, verb, onLogin}) => {
	if ( ! verb) verb = DataStore.getValue(verbPath) || 'register';
	return (
		<div className='login-widget'>
			<LoginWidgetGuts services={services} verb={verb} onLogin={onLogin}/>
			<SwitchVerb verb={verb} />
		</div>
	);
};

const SwitchVerb = ({verb}) => {
	if ( ! verb) verb = DataStore.getValue(verbPath);
	if (verb === 'register') {
		return (
			<div className='switch-verb'>
				Already have an account? <button className='btn btn-primary' onClick={e => stopEvent(e) && DataStore.setValue(verbPath, 'login')} >Login</button>
			</div>
		);
	}
	return (
		<div className='switch-verb'>
			Don&#39;t yet have an account? <button className='btn btn-primary' onClick={e => stopEvent(e) && DataStore.setValue(verbPath, 'register')} >Register</button>
		</div>
	);
};

const LoginWidgetGuts = ({services, verb, onLogin}) => {
	if (!verb) verb = DataStore.getValue(verbPath) || 'login';
	return (
		<div className="login-guts container-fluid">
			<div className="login-divs row">
				<div className="login-email col-sm-6">
					<EmailSignin
						verb={verb}
						onLogin={onLogin}
					/>
				</div>
				<div className="login-social col-sm-6">
					<SocialSignin verb={verb} services={services} />
				</div>
			</div>
		</div>
	);
};


export default LoginWidget;
export {LoginLink, LoginWidgetEmbed};
