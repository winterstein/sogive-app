import {assert} from 'sjtest';
import DataClass, {getId} from '../../base/data/DataClass';
import C from '../../C';
import Ticket from './Ticket';

/** impact utils */
class Event extends DataClass {
	constructor(base) {
		super(base);
		Object.assign(this, base);
		// NB: EditEventPage will make one default ticket -- cant do it here as no ID yet
	}
}
DataClass.register(Event, "Event");
export default Event;

/**
 * Tickets (but not Cards or custom Tips)
 * @param {!Event} event 
 * @returns {!Ticket[]} Can be empty.
 */
Event.ticketTypes = event => {
	let tts = event.ticketTypes || [];
	let justTickets = tts.filter(tt => ! Ticket.isCard(tt) && ! Ticket.isTip(tt));
	return justTickets;
};

Event.charityId = e => e && e.charityId;

Event.date = e => e && e.date;
