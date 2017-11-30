
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import {isa, nonce, defineType} from './DataClass';
import {uid, blockProp} from 'wwutils';
import MonetaryAmount from './charity/MonetaryAmount';
import C from '../C';
import Login from 'you-again';
import DataStore from '../plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';

const Transfer = defineType(C.TYPES.Transfer);
const This = Transfer;
export default Transfer;


/** Add up the prices of all the items in the basket 
 * @returns {MonetaryAmount} never null
*/
Transfer.getTotal = (list, to) => {
	assMatch(to, String);
	// Using this clumsy forEach instead of a reduce because this makes it clearer
	// that the total's MonetaryAmount object (thus currency) is based on the first item
	let total = null;
	list.forEach((item) => {
		This.assIsa(item);
		let amount = item.amount;
		MonetaryAmount.assIsa(amount);
		if (item.to !== to) { // TODO user with multiple IDs, eg email+Twitter
			// Login.iam(to)
			amount = MonetaryAmount.mul(amount, -1);
		}
		if (total === null) {
			total = amount;
		} else {
			total = MonetaryAmount.add(total, amount);
		}		
	});
	return total || MonetaryAmount.make();
};

/**
 * TODO do this server-side
 */
Transfer.getCredit = () => {
	let uxid = Login.getId();
	if ( ! uxid) return null;
	const pvCreditToMe = DataStore.fetch(['list', 'Transfer', 'toFrom:'+Login.getId()], () => {	
		return ServerIO.load('/credit/list', {data: {toFrom: Login.getId()} });
	});
	if (pvCreditToMe.value) {
		// sum them
		let cred = Transfer.getTotal(pvCreditToMe.value.hits, uxid);
		return cred;
	}
	return null;
};
