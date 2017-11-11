import {assert, assMatch} from 'sjtest';
import {isa} from '../DataClass';
import {blockProp} from 'wwutils';
import C from '../../C';
import md5 from 'md5';
import Ticket from './Ticket';

/** impact utils */
const FundRaiser = {};
/** This makes it easier to copy-paste code between similar classes */
const This = {};
export default FundRaiser;

// duck type: needs a value
This.type = C.TYPES.FundRaiser;
This.isa = (obj) => isa(obj, This.type)
		// sneaky place to add safety checks
		&& blockProp(obj, 'charity', This.type+' - use charityId()')
		&& blockProp(obj, 'event', This.type+' - use eventId()')
		&& true;
This.assIsa = (p) => assert(This.isa(p), This.type, p);
This.name = (ngo) => This.assIsa(ngo) && ngo.name;

This.oxid = obj => obj.oxid || (obj.owner && obj.owner.xid);

This.eventId = obj => obj.eventId;
This.charityId = obj => obj.charityId;

/**
 * event + email => fund-raiser
 * Important: This is duplicated in Java
 */
FundRaiser.getIdForTicket = (ticket) => {
	// NB: hash with salt to protect the users email
	assMatch(Ticket.getEventId(ticket), String, ticket);
	assMatch(ticket.attendeeEmail, String, ticket);
	return Ticket.getEventId(ticket)+'.'+md5('user:'+ticket.attendeeEmail);
};

FundRaiser.make = (base) => {
	assert(base.event, base);
	let ma = {
		'@type': C.TYPES.FundRaiser,
		...base
	};
	FundRaiser.assIsa(ma);
	return ma;
};
