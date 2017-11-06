import {assert} from 'sjtest';
import {isa} from '../DataClass';
import C from '../../C';

/** impact utils */
const Event = {};
export default Event;

// duck type: needs a value
Event.isa = (obj) => isa(obj, C.TYPES.Event);
Event.assIsa = (obj) => assert(Event.isa(obj), "Event.js - not "+obj);

Event.make = (base = {}) => {
	let ma = {
		'@type': C.TYPES.FundRaiser,
		...base
	};
	Event.assIsa(ma);
	return ma;
};
