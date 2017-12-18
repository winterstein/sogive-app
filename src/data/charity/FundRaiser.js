import {assert, assMatch} from 'sjtest';
import {isa} from '../DataClass';
import Money from './Money';
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


const nextTarget = (number) => {
	// Start with a raw target one digit bigger than the total so far (ie raw target for 0-99.99 = 100, raw target for 100-999.99 = 1000)
	let target = 10 ** Math.ceil(Math.log10(number));
	// ...people will definitely feel patronised if we encourage them to shoot for £1, so set a minimum.
	if (target < 100) return 100;
	// OK, should we pick a slightly closer goal?
	if (number > target * 0.5) return target; // e.g. £500 to £999.99 = "Aim for £1000!"
	if (number > target * 0.2) return target * 0.5; // e.g. £200 to £499.99 -> "Aim for £500!"
	return target * 0.2; // e.g. £100 to £199.99 -> "Aim for £200!"
};

This.target = item => {
	This.assIsa(item);
	
	if (item.userTarget && item.userTarget.value) return item.userTarget;

	if (item.target && item.target.value) return item.target;

	item.target = Money.make({value: nextTarget(This.donated(item).value)});
	
	// TODO more than the total donations
	return item.target;
};

/**
 * @returns {Money} the total donated
 */
This.donated = item => {
	This.assIsa(item);
	// TODO rely on the server summing and storing the donations.
	// -- to avoid having to load all (might be 1000s for a popular fundraiser).
	return item.donated || Money.make();
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
	return Ticket.eventId(ticket)+'.'+md5('user:'+Ticket.oxid(ticket));
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
