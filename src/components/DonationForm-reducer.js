
const initialState = {
	amount: 10,
	giftAid: false,
	giftAidTaxpayer: false,
	giftAidOwnMoney: false,
	giftAidNoCompensation: false,
	giftAidNoLottery: false,
	name: '',
	address: '',
	postcode: '',
	giftAidAddressConsent: false,
	ready: true,
	pending: false,
	complete: false,
};

const checkDonationForm = (state, action) => {
	const { field, value } = action;

	const newState = {
		...state,
		[field]: value,
	};

	newState.ready = (
		// have to be donating something
		(
			newState.amount &&
			newState.amount > 0
		) &&
		// if gift-aiding, must have checked all confirmations
		(
			!newState.giftAid ||
			(
				newState.giftAidTaxpayer &&
				newState.giftAidOwnMoney &&
				newState.giftAidNoCompensation &&
				newState.giftAidNoLottery &&
				(newState.name.trim().length > 0) &&
				(newState.address.trim().length > 0) &&
				(newState.postcode.trim().length > 0) &&
				newState.giftAidAddressConsent
			)
		)
	);

	return newState;
};

const donationFormReducer = (state = initialState, action) => {
	switch (action.type) {
	case 'DONATION_FORM_UPDATE':
		return checkDonationForm(state, action);
	case 'DONATION_REQUESTED':
		return {
			...state,
			pending: true,
		};
	case 'DONATION_RESPONSE':
		return {
			...state,
			pending: false,
			complete: true,
		};
	default:
		return state;
	}
};


export default donationFormReducer;
