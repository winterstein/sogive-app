import ServerIO from '../plumbing/ServerIO';

export const donate = (dispatch, donationParams, stripeResponse) => {
	const params = {
		...donationParams,
		stripeToken: stripeResponse.id,
		stripeTokenType: stripeResponse.type,
		stripeEmail: stripeResponse.email,
	};
	ServerIO.donate(params)
	.then(function(response) {
		// Action dispatched on server response
		dispatch({
			type: 'DONATION_RESPONSE',
			response,
		});
	}, function(error) {
		dispatch({
			type: 'DONATION_RESPONSE',
			error,
		});
	});
	// Action dispatched immediately
	return {
		type: 'DONATION_REQUESTED',
		params,
	};
};

export const updateForm = (charityId, field, value) => ({
	type: 'DONATION_FORM_UPDATE',
	charityId,
	field,
	value,
});

export const initDonationForm = (charityId) => ({
	type: 'DONATION_FORM_INIT',
	charityId,
});
