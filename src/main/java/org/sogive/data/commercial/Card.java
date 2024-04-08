package org.sogive.data.commercial;

import org.sogive.data.user.Donation;
import org.sogive.data.user.GiftCard;

import com.winterwell.data.AThing;
import com.winterwell.es.ESKeyword;
import com.winterwell.utils.Utils;
import com.winterwell.web.data.XId;

/**
 * eg a Xmas card
 * 
 * @see GiftCard which unlike this transfers money
 * @author daniel
 *
 */
public class Card extends AThing {

	public static final String KIND_CARD = "Card";

	@ESKeyword
	String basketId;

	@ESKeyword
	String charityId;

	String description;

	// TODO
	Donation donation;

	Boolean emailed;

	/** Who created this giftcard? */
	XId generatedBy;

	@ESKeyword
	String img;

	String message;


	@ESKeyword
	String parentTicketId;

	Boolean posted;

	@ESKeyword
	String shopId;

	@ESKeyword
	String ticketId;

	String toAddress;

	@ESKeyword
	String toEmail;

	String toName;
	public Card(Ticket ticket, Basket basket) {
		// important - duplicated in js
		this.id = "card." + FundRaiser.getIDForTicket(ticket);
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

	public void setEmailed(boolean emailed) {
		this.emailed = emailed;
	}
}
