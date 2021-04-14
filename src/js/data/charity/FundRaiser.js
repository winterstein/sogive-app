
import DataClass from '../../base/data/DataClass';
import Money from '../../base/data/Money';
import C from '../../C';
import md5 from 'md5';
import Ticket from './Ticket';
import DataStore from '../../base/plumbing/DataStore';
import ActionMan from '../../base/plumbing/ActionManBase';
import XId from '../../base/data/XId';

/** impact utils */
class FundRaiser extends DataClass {

}
DataClass.register(FundRaiser, "FundRaiser");
/** `This` makes it easier to copy-paste code between similar classes */
const This = FundRaiser;
export default FundRaiser;

window.FundRaiser = FundRaiser; // for debug

// This.isa = (obj) => isa(obj, This.type)
// 		// sneaky place to add safety checks
// 		&& blockProp(obj, 'charity', This.type+' - use charityId()')
// 		&& blockProp(obj, 'event', This.type+' - use eventId()')
// 		&& true;

This.oxid = obj => obj.oxid || (obj.owner && obj.owner.xid);

This.eventId = obj => obj.eventId;
This.charityId = obj => obj.charityId;

/**
 * Can do some fetching
 * @returns {?NGO}
 */
This.charity = item => {
	let cid = This.charityId(item);
	if ( ! cid) {
		// recover it from the event?
		let eventId = This.eventId(item);
		let pvEvent = ActionMan.getDataItem({type:C.TYPES.Event, id:eventId, status:C.KStatus.PUBLISHED});
		if (pvEvent.resolved) {
			cid = pvEvent.value.charityId;
		}
		console.warn("FundRaiser.js - No charity!", item, cid);
		if ( ! cid) return null;
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

/**
 * @returns {?Money}
 * TODO target value = -1 means "no targets please"
 */
This.target = item => {
	This.assIsa(item);
	
	if (item.userTarget && Money.value(item.userTarget)) return item.userTarget;

	if (item.target && Money.value(item.target)) return item.target;

	item.target = new Money({value: nextTarget(This.donated(item).value)});
	
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
	assMatch(Ticket.eventId(ticket), String, ticket);
	// assMatch(ticket.attendeeEmail, String, ticket);
	// pick a "nice" but unique id - e.g. daniel.moonwalk.uydx
	let uname = XId.id(Ticket.oxid(ticket));
	// avoid exposing the persons email
	if (uname.indexOf("@") !== -1) uname = uname.substring(0, uname.indexOf("@"));
	let safeuname = uname.replace(/\W/g, '');
	// so repeat calls give the same answer (no random), but it should be unique enough
	let predictableNonce = md5(uname+ticket.id).substring(0, 6);
	console.log("FundRaiser idForTicket from ", safeuname, Ticket.eventId(ticket), ticket.id, ticket);
	return safeuname+'.'+Ticket.eventId(ticket)+'.'+predictableNonce;		
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
