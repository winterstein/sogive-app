
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import {isa, nonce} from '../DataClass';
import {uid, blockProp} from 'wwutils';
import MonetaryAmount from './MonetaryAmount';

const Ticket = {};
const This = Ticket;
export default Ticket;

Ticket.type = 'Ticket';

This.isa = (obj) => isa(obj, This.type)
		// sneaky place to add safety checks
		&& blockProp(obj, 'charity', This.type+' - use charityId()')
		&& blockProp(obj, 'event', This.type+' - use eventId()')
		&& true;
This.assIsa = (p) => assert(This.isa(p), p);
This.name = (ngo) => This.assIsa(ngo) && ngo.name;

This.eventId = obj => obj.eventId;
This.charityId = obj => obj.charityId;

This.oxid = item => item.attendeeEmail+'@email';

/**
 * 
 */
Ticket.make = (base, eventId) => {
	assMatch(eventId, String);
	const obj = {
		eventId: eventId,
		id: eventId+'.'+nonce(),
		price: MonetaryAmount.make(),
		...base
	};
	obj['@type'] = This.type;
	This.assIsa(obj);
	return obj;
};
