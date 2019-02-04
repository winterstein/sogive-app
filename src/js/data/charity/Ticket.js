
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import DataClass, {nonce} from '../../base/data/DataClass';
import {uid, blockProp} from 'wwutils';
import Money from '../../base/data/Money';

class Ticket extends DataClass {

}
DataClass.register(Ticket);
const This = Ticket;
export default Ticket;

// This.isa = (obj) => isa(obj, This.type)
// 		// sneaky place to add safety checks
// 		&& blockProp(obj, 'charity', This.type+' - use charityId()')
// 		&& blockProp(obj, 'event', This.type+' - use eventId()')
// 		&& true;

This.eventId = obj => obj.eventId;
This.charityId = obj => obj.charityId;

This.oxid = item => item.attendeeEmail+'@email';

/**
 * TODO refactor into constructor
 */
Ticket.make = (base, eventId) => {
	assMatch(eventId, String);
	const obj = {
		eventId: eventId,
		price: new Money(),
		// base price will override the blank above if set
		...base,
		// Use a fresh ID
		id: eventId+'.'+nonce()
	};
	obj['@type'] = 'Ticket';
	This.assIsa(obj);
	return obj;
};
