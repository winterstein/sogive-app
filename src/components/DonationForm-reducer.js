const initialState = {
	donationAmount: 1000,
	addGiftAid: false,
	giftAidTaxpayer: false,
	giftAidOwnMoney: false,
	giftAidNoCompensation: false,
	giftAidNoLottery: false,
	donateOK: true,
};

const checkDonationForm = (state, action) => {
	const { donationAmount, addGiftAid, giftAidTaxpayer, giftAidOwnMoney, giftAidNoCompensation, giftAidNoLottery } = state;
	const { field, value } = action;
	// Validation!
	const donateOK = (
		// have to be donating something
		(
			donationAmount &&
			donationAmount > 0
		) &&
		// if gift-aiding, must have checked all confirmations
		(
			!addGiftAid ||
			(
				giftAidTaxpayer &&
				giftAidOwnMoney &&
				giftAidNoCompensation &&
				giftAidNoLottery
			)
		)
	);
	return {
		...state,
		[field]: value,
		donateOK,
	};
};

const donationFormReducer = (state = initialState, action) => {
	switch (action.type) {
	case 'DONATION_FORM_UPDATE':
		return checkDonationForm(state, action);
	case 'DONATION_REQUESTED':
		console.log('DONATION_REQUESTED', action);
		return state;
	case 'DONATION_RESPONSE':
		console.log('DONATION_RESPONSE', action);
		return state;
	default:
		return state;
	}
};

export default donationFormReducer;
