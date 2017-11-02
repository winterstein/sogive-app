
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import {isa, nonce} from '../DataClass';
import {uid} from 'wwutils';
import MonetaryAmount from './MonetaryAmount';

const Ticket = {};
export default Ticket;

Ticket.type = 'Ticket';

Ticket.isa = (ngo) => isa(ngo, Ticket.type);
Ticket.assIsa = (p) => assert(Ticket.isa(p));
Ticket.name = (ngo) => Ticket.assIsa(ngo) && ngo.name;

Ticket.make = (base, baseId) => {
	assMatch(baseId, String);
	return {
		id: baseId+'.'+nonce()
	};
};
