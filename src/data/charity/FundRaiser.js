import {assert, assMatch} from 'sjtest';
import {isa, defineType} from '../DataClass';
import Money from './Money';
import {blockProp} from 'wwutils';
import C from '../../C';
import md5 from 'md5';
import Ticket from './Ticket';
import DataStore from '../../plumbing/DataStore';
import ActionMan from '../../plumbing/ActionMan';

/** impact utils */
const FundRaiser = defineType(C.TYPES.FundRaiser);
/** `This` makes it easier to copy-paste code between similar classes */
const This = FundRaiser;
export default FundRaiser;

This.isa = (obj) => isa(obj, This.type)
		// sneaky place to add safety checks
		&& blockProp(obj, 'charity', This.type+' - use charityId()')
		&& blockProp(obj, 'event', This.type+' - use eventId()')
		&& true;

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
	// ...people will definitely feel patronised if we encourage them to shoot for £1, so set a minimum.
	// so £150 = "Aim for £200!", £200+ = "Aim for £500!", £500+ = "Aim for £1000!"
	let target = Math.max(10 ** Math.ceil(Math.log10(number)), 100);
	if (number > target * 0.5) return target;
	if (number > target * 0.2) return target * 0.5;
	return target * 0.2;
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
	assMatch(item.donated, "?Money");
	return item.donated;	
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
