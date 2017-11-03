import _ from 'lodash';
import {assert} from 'sjtest';
import {isa} from '../DataClass';
import C from '../../C';

/** impact utils */
const MonetaryAmount = {};
export default MonetaryAmount;

// ref: https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
const isNumeric = value => {
  return ! isNaN(value - parseFloat(value));
};

// duck type: needs a value
MonetaryAmount.isa = (obj) => isa(obj, C.TYPES.MonetaryAmount) || (obj && isNumeric(obj.value));
MonetaryAmount.assIsa = (obj) => assert(MonetaryAmount.isa(obj));

MonetaryAmount.make = base => {
	const item = {
		value: 0, // default
		currency: 'GBP', // default
		...base, // Base comes after defaults so it overrides
		'@type': C.TYPES.MonetaryAmount, // @type always last so it overrides erroneous base.type
	};

	MonetaryAmount.assIsa(item);
	return item;
};

