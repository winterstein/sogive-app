const changeTab = (state, action) => {
	switch (action.type) {
	case 'CHANGE_TAB':
		return {
			...state,
			navigation: {
				...state.navigation,
				tab: action.value,
			},
		};
	default:
		return state;
	}
};

export default changeTab;
