package org.sogive.data.commercial;

import org.sogive.data.user.Donation;
import org.sogive.data.user.GiftCard;

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

	@ESKeyword
	String img;

	String description;

	String message;

	XId oxid;
	
	public Card(Ticket ticket, Basket basket) {
		// important - duplicated in js
		this.id = "card."+FundRaiser.getIDForTicket(ticket);
//		generatedBy = basket.get // TODO!
		this.name = ticket.name;
		ticketId = ticket.getId();
		parentTicketId = ticket.getParentId();
		shopId = ticket.getEventId();
		basketId = basket.getId();
		charityId = Utils.or(ticket.getId(), basket.getId());
		img = ticket.attendeeIcon;
		description = ticket.description;
		toName = ticket.attendeeName;
		toEmail = ticket.attendeeEmail;
		toAddress = ticket.attendeeAddress;
		message = ticket.message;
		posted = false;
		emailed = false;
		oxid = basket.oxid;
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
	String shopId;
	
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
	
	public void setEmailed(boolean emailed) {
		this.emailed = emailed;
	}
}
