import {assert} from 'sjtest';
import {isa, nonce, defineType} from '../DataClass';
import C from '../../C';
import Money from './Money';
import DataStore from '../../plumbing/DataStore';

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
Donation.assIsa = (obj) => assert(Donation.isa(obj), "Donation.js - not "+obj);

Donation.getTotal = (don) => {
	// TODO + contributions - fees
	// TODO test
	let ttl = don.amount;
	if (don.contributions) {
		don.contributions.forEach(money => ttl = ttl+money);
	}
	if (don.fees) {
		don.fees.forEach(money => ttl = ttl-money);
	}
	return ttl;
};

/**
 * 
 * @param {Donation} don 
 * @returns {Money}
 */
Donation.amount = don => This.assIsa(don) && don.amount;

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

