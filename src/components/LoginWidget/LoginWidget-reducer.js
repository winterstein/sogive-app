const initialState = {
	user: null, // User object
	pending: false, // Waiting for server response on login/out/check
	showDialog: false, // Login dialog open
	person: '', // Login email
	password: '',
	verb: 'login', // Mode for login widget (login/register/reset)
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
			showDialog: (action.showDialog === undefined) ? !(action.user) : action.showDialog,
			pending: false,
		};

	case 'LOGIN_DIALOG_STATE':
		return {
			...state,
			showDialog: action.value,
			verb: action.verb,
		};

	case 'LOGIN_DIALOG_UPDATE_FIELD':
		return {
			...state,
			[action.field]: action.value,
		};

	default:
		return state;
	}
};

export default loginWidgetReducer;
