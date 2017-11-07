
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

/**
 * @returns {!Object[]}
 */
Basket.getItems = (basket) => {
	if ( ! basket.items) basket.items = [];
	return basket.items;
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
