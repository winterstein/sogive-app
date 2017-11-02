import {assert} from 'sjtest';
import {isa} from '../DataClass';
import C from '../../C';

/** impact utils */
const MonetaryAmount = {};
export default MonetaryAmount;

// ref: https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
function isNumeric(value) {
  return ! isNaN(value - parseFloat(value));
}

// duck type: needs a value
MonetaryAmount.isa = (obj) => isa(obj, 'MonetaryAmount') || (obj && isNumeric(obj.value));
MonetaryAmount.assIsa = (obj) => assert(MonetaryAmount.isa(obj));

MonetaryAmount.make = (base = {}) => {
	// default to £0
	let ma = {
		value: 0,
		'@type': C.TYPES.MonetaryAmount,
		...base
	};
	Object.assign(ma, base); // hopefully base.currency is defined
	MonetaryAmount.assIsa(ma);
	return ma;
};

