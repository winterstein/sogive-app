import {assert} from 'sjtest';
import {isa} from './DataClass';
import C from '../C';

const Basket = {};
export default Basket;

Basket.type = C.TYPES.Basket;

Basket.isa = (obj) => isa(obj, Basket.type);
Basket.assIsa = (obj) => assert(Basket.isa(obj), "Basket.js - not "+obj);

Basket.getItems = (basket) => {
	return basket.items || [];
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
