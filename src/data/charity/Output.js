
import {assert, assMatch} from 'sjtest';
import _ from 'lodash';
import {isa} from '../DataClass';

/** impact utils */
const Output = {};
export default Output;

Output.isa = (ngo) => isa(ngo, 'Output');
Output.assIsa = (ngo) => assert(Output.isa(ngo), "Output.js - "+ngo);

/**
 * A scaled version 
 * @param donationAmount {MonetaryAmount}
 */
Output.scaleByDonation = (output, donationAmount) => {
	// deep copy
	let impact = _.cloneDeep(output);
	// TODO scaled by donationAmount
	// TODO change units if necc
	// TODO Java needs a mirror of this :(
	console.error("scale!", impact, donationAmount);
	return impact;
};
