import ServerIO from '../plumbing/ServerIO';

// eslint-disable-next-line
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
