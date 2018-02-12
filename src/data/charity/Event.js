import {assert} from 'sjtest';
import {isa, defineType} from '../DataClass';
import C from '../../C';

/** impact utils */
const Event = defineType(C.TYPES.Event);
export default Event;



Event.make = (base = {}) => {
	let ma = {
		'@type': C.TYPES.Event,
		...base
	};
	Event.assIsa(ma);
	return ma;
};
