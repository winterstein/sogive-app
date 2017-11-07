
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import {isa, nonce} from './DataClass';
import {uid} from 'wwutils';
import MonetaryAmount from './charity/MonetaryAmount';


const Basket = {};
export default Basket;

Basket.type = 'Basket';
Basket.isa = (ngo) => isa(ngo, Basket.type);
Basket.assIsa = (p) => assert(Basket.isa(p));

// To get a Basket, use ActionMan.getBasketPV

/**
 * @return {Object[]} Never null
 */
Basket.getItems = (basket) => {
	return basket.items || [];
};

