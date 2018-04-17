
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import {isa, nonce, defineType} from '../../base/data/DataClass';
import {uid, blockProp} from 'wwutils';
import Money from './Money';

const Ticket = defineType('Ticket');
const This = Ticket;
export default Ticket;

This.isa = (obj) => isa(obj, This.type)
		// sneaky place to add safety checks
		&& blockProp(obj, 'charity', This.type+' - use charityId()')
		&& blockProp(obj, 'event', This.type+' - use eventId()')
		&& true;

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
		price: Money.make(),
		// base price will override the blank above if set
		...base,
		// Use a fresh ID
		id: eventId+'.'+nonce()
	};
	obj['@type'] = This.type;
	This.assIsa(obj);
	return obj;
};
