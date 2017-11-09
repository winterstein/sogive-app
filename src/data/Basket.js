
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import {isa, nonce} from './DataClass';
import {uid} from 'wwutils';
import MonetaryAmount from './charity/MonetaryAmount';
import C from '../C';

const Basket = {};
export default Basket;

// To get a Basket, use ActionMan.getBasketPV

Basket.type = C.TYPES.Basket;

Basket.isa = (obj) => isa(obj, Basket.type);
Basket.assIsa = (obj) => assert(Basket.isa(obj), "Basket.js - not "+obj);

Basket.idForUxid = (uxid) => "for_"+uxid;


/**
 * @returns {!Object[]}
 */
Basket.getItems = (basket) => {
	if ( ! basket.items) basket.items = [];
	return basket.items;
};

// Add up the prices of all the items in the basket
Basket.getTotal = (basket) => {
	// Using this clumsy forEach instead of a reduce because this makes it clearer
	// that the total's MonetaryAmount object (thus currency) is based on the first item
	let total = null;
	Basket.getItems(basket).forEach((item) => {
		MonetaryAmount.assIsa(item.price);
		if (total === null) {
			total = item.price;
		} else {
			total = MonetaryAmount.add(total, item.price);
		}
	});
	return total || MonetaryAmount.make();
};

Basket.make = (base = {}) => {
	let ma = {
		items: [],
		...base,
		'@type': Basket.type,
	};
	Basket.assIsa(ma);
	return ma;
};
