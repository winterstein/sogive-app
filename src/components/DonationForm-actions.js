import ServerIO from '../plumbing/ServerIO';
import NGO from '../data/charity/NGO';
import Output from '../data/charity/Output';
import MonetaryAmount from '../data/charity/MonetaryAmount';

export const donate = (dispatch, charity, donationForm, stripeResponse) => {
	const donationParams = {
		action: 'donate',
		charityId: charity['@id'],
		currency: 'GBP',
		giftAid: donationForm.giftAid,
		// impact: donationForm.impact,
		value: donationForm.amount,
		value100: Math.floor(donationForm.amount * 100),
		name: donationForm.name,
		address: donationForm.address,
		postcode: donationForm.postcode,
		stripeToken: stripeResponse.id,
		stripeTokenType: stripeResponse.type,
		stripeEmail: stripeResponse.email,
	};
	MonetaryAmount.assIsa(donationParams);

	// Add impact to submitted data
	const project = NGO.getProject(charity);
	if (project && project.outputs) {		
		let donationImpacts = project.outputs.map(output => Output.scaleByDonation(output, donationParams));
		donationParams.impacts = JSON.stringify(donationImpacts);
	}

	ServerIO.donate(donationParams)
	.then(function(response) {
		// Action dispatched on server response
		dispatch({
			type: 'DONATION_RESPONSE',
			charityId: charity['@id'],
			response,
		});
	}, function(error) {
		dispatch({
			type: 'DONATION_RESPONSE',
			charityId: charity['@id'],
			error,
		});
	});
	// Action dispatched immediately
	return {
		type: 'DONATION_REQUESTED',
		charityId: charity['@id'],
		donationParams,
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
