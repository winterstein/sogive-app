import {assert} from 'sjtest';
import {isa} from '../DataClass';
import C from '../../C';

/** impact utils */
const MonetaryAmount = {};
export default MonetaryAmount;

/* 

{
	currency: {String}
	value: {String|Number} The Java backend stores values as String and uses BigDecimal to avoid numerical issues.
	The front end generally handles them as Number, but sometimes as String.
}

*/
// ref: https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
const isNumeric = value => {
	return ! isNaN(value - parseFloat(value));
};

// duck type: needs a value
MonetaryAmount.isa = (obj) => isa(obj, C.TYPES.MonetaryAmount) || (obj && isNumeric(obj.value));
MonetaryAmount.assIsa = (obj) => assert(MonetaryAmount.isa(obj), "MonetaryAmount.js - "+obj);

MonetaryAmount.make = (base = {}) => {
	const item = {
		value: 0, // default
		currency: 'GBP', // default
		...base, // Base comes after defaults so it overrides
		'@type': C.TYPES.MonetaryAmount, // @type always last so it overrides any erroneous base.type
	};

	MonetaryAmount.assIsa(item);
	return item;
};
