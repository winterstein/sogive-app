import _ from 'lodash';
import {assert} from 'sjtest';
import {isa} from '../DataClass';

/** impact utils */
const MonetaryAmount = {};
export default MonetaryAmount;

// duck type: needs currency & value
MonetaryAmount.isa = (obj) => isa(obj, 'MonetaryAmount') || (obj && obj.currency && _.isNumber(obj.value));
MonetaryAmount.assIsa = (obj) => assert(MonetaryAmount.isa(obj));

MonetaryAmount.make = (base = {}) => {
	// default to £0
	let ma = {value:0, '@type':'MonetaryAmount'};
	Object.assign(ma, base);
	MonetaryAmount.assIsa(ma);
	return ma;
};
