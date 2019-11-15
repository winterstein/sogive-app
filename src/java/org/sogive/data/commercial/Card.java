package org.sogive.data.commercial;

import org.sogive.data.user.Donation;
import org.sogive.data.user.GiftCard;
import org.sogive.server.payment.IForSale;

import com.winterwell.data.AThing;
import com.winterwell.es.ESKeyword;
import com.winterwell.utils.Utils;
import com.winterwell.web.data.XId;

/**
 * eg a Xmas card
 * @see GiftCard which unlike this transfers money
 * @author daniel
 *
 */
public class Card extends AThing {

	public Card(Ticket ticket, Basket basket) {
		// important - duplicated in js
		this.id = "card."+FundRaiser.getIDForTicket(ticket);
//		generatedBy = basket.get // TODO!
		ticketId = ticket.getId();
		parentTicketId = ticket.getParentId();
		basketId = basket.getId();
		charityId = Utils.or(ticket.getId(), basket.getId());
		toName = ticket.attendeeName;
		toEmail = ticket.attendeeEmail;
		toAddress = ticket.attendeeAddress;
		posted = false;
		emailed = false;
	}
	public static final String KIND_CARD = "Card";

	/** Who created this giftcard? */	
	XId generatedBy;

	// TODO
	Donation donation;
	
	@ESKeyword
	String ticketId;

	@ESKeyword
	String parentTicketId;
	
	@ESKeyword
	String basketId;
	
	@ESKeyword
	String charityId;
	
	String toName;
	
	@ESKeyword
	String toEmail;
	
	String toAddress;

	Boolean posted;
	Boolean emailed;
}
