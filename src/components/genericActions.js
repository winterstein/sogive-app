import Login from 'hooru';

export const updateField = (type, field, value) => {
	return {
		type,
		field,
		value,
	};
};

export const loginChanged = function(dispatch) {
	dispatch({
		type: 'LOGIN_RESOLVED',
		user: Login.getUser(),
	});
};

export const changeLogin = function(dispatch, changeFn) {
	changeFn()
		.always(() => {
			loginChanged(dispatch);
		});
	return {
		type: 'LOGIN_PENDING',
	};
};

export const logout = function(dispatch) {
	return changeLogin(dispatch, () => Login.logout());
};

