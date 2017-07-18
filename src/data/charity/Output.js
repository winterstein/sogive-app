
import {assert, assMatch} from 'sjtest';
import {deepCopy} from 'wwutils';

/** impact utils */
const Output = {};
export default Output;

/**
 * A scaled version 
 * @param donationAmount {MonetaryAmount}
 */
Output.scaleByDonation = (output, donationAmount) => {
	// deep copy
	let impact = deepCopy(output);
	// TODO scaled by donationAmount
	// TODO change units if necc
	// TODO Java needs a mirror of this :(
};
