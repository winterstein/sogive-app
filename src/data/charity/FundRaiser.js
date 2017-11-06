import {assert} from 'sjtest';
import {isa} from '../DataClass';
import C from '../../C';

/** impact utils */
const FundRaiser = {};
export default FundRaiser;

// duck type: needs a value
FundRaiser.isa = (obj) => isa(obj, C.TYPES.FundRaiser);
FundRaiser.assIsa = (obj) => assert(FundRaiser.isa(obj), "FundRaiser.js "+obj);

FundRaiser.make = (base = {}) => {
	let ma = {
		'@type': C.TYPES.FundRaiser,
		...base
	};
	FundRaiser.assIsa(ma);
	return ma;
};
