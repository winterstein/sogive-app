const initialState = {
	user: null, // User object
	pending: false, // Waiting for server response on login/out/check
	loginDialog: false, // Login dialog open
};


const loginWidgetReducer = (state = initialState, action) => {
	switch (action.type) {

	case 'LOGIN_PENDING':
		return {
			...state,
			pending: true,
		};
	case 'LOGIN_RESOLVED':
		return {
			...state,
			user: action.user,
		};

	case 'LOGIN_DIALOG_STATE':
		return {
			...state,
			loginDialog: action.loginDialog,
		};

	default:
		return state;
	}
};

export default loginWidgetReducer;
