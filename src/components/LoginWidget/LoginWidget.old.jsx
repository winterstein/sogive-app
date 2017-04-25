import React from 'react';
import { connect } from 'react-redux';
import { assert } from 'sjtest';
import Login from 'hooru';
import { XId, uid } from 'wwutils';
import Cookies from 'js-cookie';

import Misc from '../Misc';
import { updateField, showLoginMenu } from '../genericActions';
import { emailLogin, emailRegister, socialLogin } from './LoginWidget-actions';

/**
	TODO:
	- doEmailLogin(email, password) and doSocialLogin(service) are available as props now
	- Use them in the appropriate section of the form
*/


const SocialSignin = () => {
	const verb = this.props.verb;
	return (
		<div className="social-signin">
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
			</small></p>
		</div>
	);
};


const EmailSignin = ({ verb, person, password, doItFn, handleChange}) => {
	const passwordField = verb === 'reset' ? ('') : (
		<div className="form-group">
			<label htmlFor="password">Password</label>
			<input
				id="password_input"
				className="form-control"
				type="password"
				name="password"
				placeholder="Password"
				value={password}
				onChange={(event) => handleChange('password', event.target.value)}
			/>
		</div>
	);

	const buttonText = {
		login: 'Log in',
		register: 'Register',
		reset: 'Reset password',
	}[verb];

	// login/register
	return (
		<form
			id="loginByEmail"
			onSubmit={(event) => {
				event.preventDefault();
				doItFn();
			}}
		>
			<div className="form-group">
				<label htmlFor="person">Email</label>
				<input
					id="person_input"
					className="form-control"
					type="email"
					name="person"
					placeholder="Email"
					value={person}
					onChange={(event) => handleChange('person', event.target.value)}
				/>
			</div>
			{ passwordField }
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
const LoginWidget = ({showDialog, verb, person, password, doEmailLogin, doEmailRegister, closeMenu, handleChange}) => {
	if (!showDialog) {
		return <div />;
	}

	const heading = {
		login: 'Log In',
		register: 'Register',
		reset: 'Reset Password'
	}[verb];

	const doItFn = {
		login: doEmailLogin,
		register: doEmailRegister,
		reset: null,
	}[verb];

	return (
		<div className="login-modal" onClick={closeMenu}>
			<div className="container">
				<div className="row">
					<div className="col-sm-6 col-center">
						<div className="panel panel-default" onClick={(event) => event.stopPropagation()}>
							<div className="panel-heading">Welcome (back) to SoGive</div>
							<div className="panel-body">
								<Misc.Logo service="sogive" size='large' transparent={false} />
								<h3>{heading}</h3>
								<EmailSignin
									verb={verb}
									person={person}
									password={password}
									handleChange={handleChange}
									doItFn={() => doItFn(person, password)}
								/>
								{/*
									// Reinstate this later - put the row/column back inside the panel & restore the vertical line
									<div className="col-sm-6">
										<SocialSignin verb={verb} services={null} />
									</div>
								*/}
								{
									verb === 'register' ?
										<div>
											Already have an account?
											&nbsp;<a href='#' onClick={() => handleChange('verb', 'login')}>Login</a>
										</div> :
										<div>
											Don&#39;t yet have an account?
											&nbsp;<a href='#' onClick={() => handleChange('verb', 'register')}>Register</a>
										</div>
								}
							</div> {/* ./panel-body */}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}; // ./LoginWidget


const mapStateToProps = (state, ownProps) => ({
	...ownProps,
	...state.login,
});

const mapDispatchToProps = (dispatch) => ({
	closeMenu: () => dispatch(showLoginMenu(false)),
	doEmailLogin: (email, password) => dispatch(emailLogin(dispatch, email, password)),
	doEmailRegister: (email, password) => dispatch(emailRegister(dispatch, email, password)),
	doSocialLogin: (service) => dispatch(socialLogin(dispatch, service)),
	handleChange: (field, value) => dispatch(updateField('LOGIN_DIALOG_UPDATE_FIELD', field, value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginWidget);
