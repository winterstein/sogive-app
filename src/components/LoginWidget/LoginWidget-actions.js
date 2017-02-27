import Login from 'hooru';
import { assert, assMatch } from 'sjtest';

import { changeLogin } from '../genericActions';
import ServerIO from '../../plumbing/ServerIO';

const AUTH_SERVICES = ['twitter', 'facebook'];

export const emailLogin = function(dispatch, email, password) {
	assMatch(email, String);
	assMatch(password, String);

	return changeLogin(dispatch, () => Login.login(email, password));
};

export const emailRegister = function(dispatch, email, password) {
	assMatch(email, String);
	assMatch(password, String);

	return changeLogin(dispatch, () => Login.register({email, password}));
};

export const socialLogin = function(dispatch, service) {
	assMatch(service, String);
	assert(AUTH_SERVICES.includes(service), service);

	return changeLogin(dispatch, () => Login.auth(service, 'sogive', Login.PERMISSIONS_ALL));
};

export const resetPassword = function(dispatch, email) {
	ServerIO.resetPassword(email)
	.then(() => {
		dispatch({
			type: 'RESET_RESOLVED',
			value: true,
		});
	}, () => {
		dispatch({
			type: 'RESET_RESOLVED',
			value: false,
		});
	});

	return {
		type: 'RESET_PENDING',
	};
};
