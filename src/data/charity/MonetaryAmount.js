
import {assert, assMatch} from 'sjtest';
import {deepCopy} from 'wwutils';
import {isa} from '../DataClass';
import _ from 'lodash';

/** impact utils */
const MonetaryAmount = {};
export default MonetaryAmount;

// duck type: needs currency & value
MonetaryAmount.isa = (ngo) => isa(ngo, 'MonetaryAmount') || (ngo.currency && _.isNumber(ngo.value));
MonetaryAmount.assIsa = (ngo) => assert(MonetaryAmount.isa(ngo));

MonetaryAmount.make = (base = {}) => {
	let ma = {};
	Object.assign(ma, base);
	ma['@Type'] = 'MonetaryAmount';
	return ma;
};
