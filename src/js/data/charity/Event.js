import {assert} from 'sjtest';
import DataClass, {getId} from '../../base/data/DataClass';
import C from '../../C';
import Ticket from './Ticket';

/** impact utils */
class Event extends DataClass {
	constructor(base) {
		super(base);
		Object.assign(this, base);
		// start with one default ticket
		if ( ! this.ticketTypes) {
			const tt = new Ticket({eventId: getId(this), name:"Standard Ticket"});
			this.ticketTypes = [tt];	
		}
	}
}
DataClass.register(Event, "Event");
export default Event;

Event.charityId = e => e && e.charityId;

Event.date = e => e && e.date;
