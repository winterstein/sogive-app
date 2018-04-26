
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import {isa, nonce, defineType} from './DataClass';
import {uid, blockProp} from 'wwutils';
import Money from './charity/Money';
import C from '../C';
import Login from 'you-again';
import DataStore from '../plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';

const Transfer = defineType(C.TYPES.Transfer);
const This = Transfer;
export default Transfer;


/** Add up the prices of all the items in the basket 
 * @returns {Money} never null
*/
Transfer.getTotal = (list, to) => {
	assMatch(to, String);
	// Using this clumsy forEach instead of a reduce because this makes it clearer
	// that the total's Money object (thus currency) is based on the first item
	let total = Money.make();
	list.forEach((item) => {
		This.assIsa(item);
		let amount = item.amount;
		Money.assIsa(amount);
		if (item.to !== to) { // TODO user with multiple IDs, eg email+Twitter
			// Login.iam(to)
			amount = Money.mul(amount, -1);
		}
		total = Money.add(total, amount);				
	});
	return total || Money.make();
};

/**
 * TODO do this server-side
 */
Transfer.getCredit = (uxid) => {
	if ( ! uxid) uxid = Login.getId();
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
