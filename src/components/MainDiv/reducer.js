const PAGES = {
	search: true,
	dashboard: true,
	account: true,
	campaign: true
};

function pageFromHash() {
	let page;
	let hash = window.location.hash.substr(1);
	if (hash.indexOf('?') !== -1) {
		hash = hash.substr(0, hash.indexOf('?'));
	}
	if (PAGES[hash]) {
		page = hash;
	} else {
	// TODO logged in? then show dashboard
		page = 'search';
	}
	return page;
}


const switchPage = (state = {page: pageFromHash()}, action) => {
	switch (action.type) {
	case 'SWITCH_PAGE':
		return {
			...state,
			page: action.page,
		};
	default:
		return state;
	}
};

export default switchPage;
