package org.sogive.data.commercial;

import org.junit.Test;

public class FundRaiserTest {

	@Test
	public void testGetIDForTicket() {
		Ticket ticket = new Ticket();
		ticket.attendeeEmail = "daniel@sodash.com";
		ticket.id = "tid1";
		ticket.eventId = "eid2";
		String fid = FundRaiser.getIDForTicket(ticket);
		System.out.println(fid);
		
		// Use this to test in js:		
//		XId = {id: xid => xid.substring(0, xid.lastIndexOf('@')) };
//		ticket = {eventId:'eid2', attendeeEmail:'daniel@sodash.com', id:'tid1'}
//		FundRaiser.getIdForTicket(ticket)
		// the results must match
	}

}
