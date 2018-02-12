
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import {isa, nonce, defineType} from './DataClass';
import {uid, blockProp} from 'wwutils';
import Money from './charity/Money';
import C from '../C';

const Basket = defineType(C.TYPES.Basket);
const This = Basket;
export default Basket;

// To get a Basket, use ActionMan.getBasketPV

// Basket is normally DRAFT (PUBLISHED = paid for)

Basket.isa = (obj) => isa(obj, Basket.type)
		// sneaky place to add safety checks
		&& blockProp(obj, 'charity', 'Basket.js - use Basket.charityId()')
		&& true;

This.eventId = obj => obj.eventId;
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
		if (total === null) {
			total = item.price;
		} else {
			total = Money.add(total, item.price);
		}
	});
	if (total && basket.hasTip && Money.isa(basket.tip)) {
		total = Money.add(total, basket.tip);
	}
	return total || Money.make();
};

Basket.make = (base = {}) => {
	// event??
	let ma = {
		items: [],
		hasTip: true,
		// tip: Money.make({value: 1}), // TODO tip/fee based on event and tickets
		...base,
		'@type': Basket.type,
	};
	Basket.assIsa(ma);
	return ma;
};
