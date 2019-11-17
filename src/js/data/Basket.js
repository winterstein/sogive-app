
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import DataClass, {nonce} from '../base/data/DataClass';
import {uid, blockProp} from 'wwutils';
import Money from '../base/data/Money';
import C from '../C';

class Basket extends DataClass {

	items = [];
	// tip: new Money({value: 1}), // TODO tip/fee based on event and tickets
	hasTip = true;

	constructor(base) {
		super(base);
		Object.assign(this, base);
	}

}
DataClass.register(Basket, "Basket");
const This = Basket;
export default Basket;

// To get a Basket, use ActionMan.getBasketPV

// Basket is normally DRAFT (PUBLISHED = paid for)

// Basket.isa = (obj) => isa(obj, Basket.type)
// 		// sneaky place to add safety checks
// 		&& blockProp(obj, 'charity', 'Basket.js - use Basket.charityId()')
// 		&& true;

/**
 * @returns {?String} eventId if set, or if all items (tickets) agree
 */
This.eventId = obj => {
	This.assIsa(obj);
	if (obj.eventId) return obj.eventId;
	const items = Basket.getItems(obj);
	let eids = items.map(i => i.eventId);
	const eidSet = new Set(eids);
	if (eidSet.size === 1) return eids[0];
	return null;
};
This.charityId = obj => obj.charityId;

Basket.idForUxid = (uxid) => "for_"+uxid;


/**
 * @returns {!Object[]}
 */
Basket.getItems = (basket) => {
	if ( ! basket.items) basket.items = [];
	return basket.items;
};

/** Add up the prices of all the items in the basket 
 * @returns {Money} never null
*/
Basket.getTotal = (basket) => {
	// Using this clumsy forEach instead of a reduce because this makes it clearer
	// that the total's Money object (thus currency) is based on the first item
	let total = null;
	Basket.getItems(basket).forEach((item) => {
		Money.assIsa(item.price);
		// skip over any NaNs
		if (isNaN(item.price.value)) {
			console.warn("Basket.js getTotal: NaN", basket, item);
			return;
		}
		if (total === null) {
			total = item.price;
		} else {
			total = Money.add(total, item.price);
		}
	});
	if (total && basket.hasTip && Money.isa(basket.tip)) {
		total = Money.add(total, basket.tip);
	}
	return total || new Money();
};
