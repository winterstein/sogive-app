import Login from 'hooru';

export const updateField = (type, field, value) => {
	return {
		type,
		field,
		value,
	};
};

/**
 * Default behaviour: Set login widget to close if logged in, open if not
 * Override by calling with showDialog set
 */
export const loginChanged = function(showDialog) {
	const user = Login.getUser();
	return {
		type: 'LOGIN_RESOLVED',
		user,
		showDialog: showDialog !== undefined ? showDialog : !user,
	};
};

export const changeLogin = function(dispatch, changeFn, showDialog) {
	changeFn()
		.always(() => {
			dispatch(
				loginChanged(showDialog)
			);
		});
	return {
		type: 'LOGIN_PENDING',
	};
};

export const logout = function(dispatch) {
	return changeLogin(dispatch, () => Login.logout(), false);
};

export const showLoginMenu = (state, verb) => ({
	type: 'LOGIN_DIALOG_STATE',
	value: state,
	verb: verb || 'login',
});
