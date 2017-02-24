import { Login } from 'hooru';
import { assert, assMatch } from 'sjtest';

import { changeLogin } from '../genericActions';

const AUTH_SERVICES = ['twitter', 'facebook'];

export const emailLogin = function(dispatch, email, password) {
	assMatch(email, String);
	assMatch(password, String);

	return changeLogin(dispatch, () => Login.login(email, password));
};

export const socialLogin = function(dispatch, service) {
	assMatch(service, String);
	assert(AUTH_SERVICES.includes(service), service);

	return changeLogin(dispatch, () => Login.auth(service, 'sogive', Login.PERMISSIONS_ALL));
};
