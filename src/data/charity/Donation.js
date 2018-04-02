import {assert} from 'sjtest';
import {isa, nonce, defineType} from '../DataClass';
import C from '../../C';
import Money from './Money';
import DataStore from '../../plumbing/DataStore';
import {XId, blockProp} from 'wwutils';

/** impact utils */
const Donation = defineType(C.TYPES.Donation);
const This = Donation;
export default Donation;

// ref: https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
function isNumeric(value) {
	return ! isNaN(value - parseFloat(value));
}

// duck type: needs a value
Donation.isa = (obj) => isa(obj, C.TYPES.Donation) || (obj && isNumeric(obj.value));
Donation.assIsa = (obj) => {
	assert(Donation.isa(obj), "Donation.js - not a Donation "+obj);
	blockProp(obj, 'fundraiser', 'Donation.js - use Donation.fundRaiser()');
	return true;
};

Donation.getTotal = (don) => {
	// TODO + contributions - fees
	// TODO test
	let ttl = Donation.amount(don);
	if (don.contributions) {
		don.contributions.forEach(money => ttl = ttl+money);
	}
	if (don.fees) {
		don.fees.forEach(money => ttl = ttl-money);
	}
	return ttl;
};

/**
 * @param {?Donation} don 
 * @returns ?String can be null for anonymous donors
 */
Donation.donorName = don => {
	if ( ! don) return null;
	This.assIsa(don);
	// did they ask to be anonymous?
	if (don.anonymous) return null;
	if ( ! don.donor) return don.donorName; // draft
	return don.donor.name || (don.donor.id && XId.prettyName(don.donor.id)) || null;
};

/**
 * 
 * @param {Donation} don 
 * @returns {Money}
 */
Donation.amount = don => This.assIsa(don) && don.amount;

/**
 * @param {Donation} don 
 * @returns fundraiser ID or null
 */
Donation.fundRaiser = don => This.assIsa(don) && don.fundRaiser;

Donation.make = (base = {}) => {
	// to must be a charity
	if (base.to) {
		let charity = DataStore.getValue('data',C.TYPES.NGO, base.to);
		if ( ! charity) console.error("Donation not to a charity?! "+base.to, base);
	}
	let ma = {
		'@type': C.TYPES.Donation,
		/* The user's contribution (this is what the user pays; not what the charity recieves) */
		amount: Money.make(),
		id: nonce(),	
		...base
	};
	Donation.assIsa(ma);
	return ma;
};

