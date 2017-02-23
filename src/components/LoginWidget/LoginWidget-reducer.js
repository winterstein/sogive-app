import Login from 'hooru';

const initialState = {
};

// Register a callback with Login to handle any changes
Login.change(function(e) {	
	// dispatch these as actions ??
	if (Login.isLoggedIn()) {
		console.warn("Login.change", e);
		DataStore.putItem(C.stateKey.login, Login.getId());
		DataStore.putItem(C.stateKey.user, Login.getUser());
	} else {
		console.warn("Login.change LOGOUT", e);
		DataStore.removeItem(C.stateKey.login);
		DataStore.removeItem(C.stateKey.user);		
	}
});
// Trigger it. Because Login has already run, but state hasnt picked it up.
Login.change();


const loginWidgetReducer = (state = initialState, action) => {
	switch (action.type) {

	// Open the login dialog
	case 'OPEN_LOGIN_DIALOG':  // TODO
		return {
			...state,
			loginDialog: true,
		};

	case 'CLOSE_DIALOG':  // TODO
		return {
			...state,
			loginDialog: false,
		};

	case 'DOLOGIN':  // TODO
		// email password?
		Login.login(email, password);
		// by twitter?
		Login.auth(service, 'sogive', Login.PERMISSIONS_ALL);

		return state;

	case 'VERIFYLOGIN': // TODO
		Login.verify();
		return state;

	case 'LOGOUT': // TODO
		const pLogout = Login.logout();
		// reload the page on logout
		pLogout.then(function() {
			// drop url ?params
			let locn = window.location.protocol+'//' + window.location.hostname + window.location.pathname;
			window.location = locn;
		});
		return {
			...state,
			loggedIn: false,
			uxid: false,	
			user: false			
		};
	default:
		return state;
	}	
};

export default loginWidgetReducer;
