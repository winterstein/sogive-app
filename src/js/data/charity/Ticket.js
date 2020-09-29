
import _ from 'lodash';
import DataClass, {nonce} from '../../base/data/DataClass';
import Money from '../../base/data/Money';

class Ticket extends DataClass {

	price = new Money();

	constructor(base) {
		super(base);
		Object.assign(this, base);
		// preserve history
		this.parentId = base? base.id : null;
		// Use a fresh ID
		this.id = this.eventId+'.'+nonce();
	}

}

DataClass.register(Ticket, "Ticket");
const This = Ticket;
export default Ticket;

/**
 * Hack: special value for ticket.kind to mark it as a greetings card
 */
Ticket.CARD_KIND = 'card';

Ticket.isCard = ticket => ticket.kind && ticket.kind.toLowerCase() === Ticket.CARD_KIND;

// This.isa = (obj) => isa(obj, This.type)
// 		// sneaky place to add safety checks
// 		&& blockProp(obj, 'charity', This.type+' - use charityId()')
// 		&& blockProp(obj, 'event', This.type+' - use eventId()')
// 		&& true;

This.eventId = obj => obj.eventId;
This.charityId = obj => obj.charityId;

This.oxid = item => item.attendeeEmail+'@email';
