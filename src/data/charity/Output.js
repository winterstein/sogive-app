
import {assert, assMatch} from 'sjtest';
import _ from 'lodash';
import {isa, defineType, getType} from '../../base/data/DataClass';

/* Output type, which also does Impact: 
{
	name {String}
	number: {Number} Number of units output, e.g. the number of malaria nets
	cost: {Money} total cost, ie cost = costPerOutput * number
	costPerOutput {Money}
	amount: {String} non-numerical descriptions of how much was output
	confidence {String}
	description: {String}
	start: {Date}
	end: {Date}
	order: {Number} for display lists
	year: {Number}
}
*/

/** impact utils */
const Output = defineType('Output');
const This = Output;
export default Output;

// something is making outputs without a type. oh well -- also allow a duck type test for costPerBen
Output.isa = (obj) => {
	return getType(obj)==='Output' || obj.costPerBeneficiary;
};

Output.number = obj => This.assIsa(obj) && obj.number;
Output.cost = obj => This.assIsa(obj) && obj.cost;

Output.make = (base = {}) => {
	assMatch(base.amount, "?String", base);
	return {
		'@type': This.type,
		...base
	};
};

/**
 * A scaled version 
 * @param donationAmount {Money}
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
