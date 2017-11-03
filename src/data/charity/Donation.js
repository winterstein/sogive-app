import {assert} from 'sjtest';
import {isa} from '../DataClass';
import C from '../../C';
import MonetaryAmount from './MonetaryAmount';

/** impact utils */
const Donation = {};
export default Donation;

// ref: https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
function isNumeric(value) {
	return ! isNaN(value - parseFloat(value));
}

// duck type: needs a value
Donation.isa = (obj) => isa(obj, C.TYPES.Donation) || (obj && isNumeric(obj.value));
Donation.assIsa = (obj) => assert(Donation.isa(obj));

Donation.make = (base = {}) => {
	let ma = {
		'@type': C.TYPES.Donation,
		amount: MonetaryAmount.make(),
		...base
	};
	Donation.assIsa(ma);
	return ma;
};

