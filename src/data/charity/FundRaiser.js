import {assert, assMatch} from 'sjtest';
import {isa} from '../DataClass';
import {blockProp} from 'wwutils';
import C from '../../C';
import md5 from 'md5';
import Ticket from './Ticket';
import DataStore from '../../plumbing/DataStore';
import ActionMan from '../../plumbing/ActionMan';

/** impact utils */
const FundRaiser = {};
/** `This` makes it easier to copy-paste code between similar classes */
const This = FundRaiser;
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
 * @returns {?NGO}
 */
This.charity = item => {
	const cid = This.charityId(item);
	if ( ! cid) {
		console.warn("FundRaiser.js - No charity!", item);
		return null;
	}
	const spec = {type:C.TYPES.NGO, id:cid, status:C.KStatus.PUBLISHED};
	let pvCharity = ActionMan.getDataItem(spec);
	return pvCharity.value;
};

/**
 * event + email => fund-raiser
 * Important: This is duplicated in Java
 * 
 * TODO what if there is no email?
 */
FundRaiser.getIdForTicket = (ticket) => {
	// NB: hash with salt to protect the users email
	assMatch(Ticket.eventId(ticket), String, ticket);
	assMatch(ticket.attendeeEmail, String, ticket);
	return Ticket.eventId(ticket)+'.'+md5('user:'+ticket.attendeeEmail);
};

FundRaiser.make = (base) => {
	assert(base.eventId, base);
	let ma = {
		'@type': C.TYPES.FundRaiser,
		...base
	};
	FundRaiser.assIsa(ma);
	return ma;
};
