import {assert} from 'sjtest';
import {isa} from '../DataClass';
import C from '../../C';
import md5 from 'md5';

/** impact utils */
const FundRaiser = {};
export default FundRaiser;

// duck type: needs a value
FundRaiser.isa = (obj) => isa(obj, C.TYPES.FundRaiser);
FundRaiser.assIsa = (obj) => assert(FundRaiser.isa(obj), "FundRaiser.js "+obj);

/**
 * event + email => fund-raiser
 */
FundRaiser.getIdForTicket = (ticket) => {
	// NB: hash with salt to protect the users email
	return ticket.event+'.'+md5('user:'+ticket.attendeeEmail);
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
