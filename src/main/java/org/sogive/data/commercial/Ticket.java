package org.sogive.data.commercial;

import com.goodloop.data.Money;
import com.winterwell.data.AThing;
import com.winterwell.es.ESKeyword;
import com.winterwell.web.data.XId;

/**
 * Hm: right now, Ticket.id is NOT unique!
 * 
 * @author daniel
 *
 */
public class Ticket extends AThing {

	String attendeeAddress;

	@ESKeyword
	String attendeeEmail;

	/**
	 * "img" would have been a better name - oh well. Minor TODO rename
	 */
	String attendeeIcon;

	String attendeeName;

	/** i.e. "Walker" */
	String attendeeNoun;

	@ESKeyword
	String charityId;

	String description;

	@ESKeyword
	String eventId;

	Boolean inviteOnly; // TODO

	/** Adult / Child / card (HACK: special value) */
	String kind;

	/**
	 * Optional message from buyer to recipient
	 */
	String message;

	/**
	 * The parent Ticket ID, or null
	 */
	@ESKeyword
	String parentId;
	String postPurchaseCTA;

	/**
	 * defaults to the user's fundraiser page
	 */
	String postPurchaseLink;

	Money price;

	/**
	 * By default, if you buy several tickets, they use the same address.
	 */
	Boolean sameAsFirst = true;

	/**
	 * TODO how many have we sold?? ?? do via DataLog or??
	 */
	Integer sold;

	/**
	 * How many can we sell?
	 */
	Integer stock;

	/**
	 * e.g. "a gentle 10 mile walk" NB: name is the title, e.g. "Wee Wander"
	 */
	String subtitle;
	String team;

	public String getAttendeeEmail() {
		return attendeeEmail;
	}

	public String getAttendeeName() {
		return attendeeName;
	}
	public String getEventId() {
		return eventId;
	}
	public String getKind() {
		return kind;
	}

	public XId getOwnerXId() {
		return attendeeEmail == null ? null : new XId(attendeeEmail, "email");
	}

	public String getParentId() {
		return parentId;
	}
	public Money getPrice() {
		return price;
	}
	public void setAttendeeEmail(String attendeeEmail) {
		this.attendeeEmail = attendeeEmail;
	}

	public void setAttendeeName(String attendeeName) {
		this.attendeeName = attendeeName;
	}

	public void setEventId(String eventId) {
		this.eventId = eventId;
	}

	public void setPrice(Money price) {
		this.price = price;
	}

	@Override
	public String toString() {
		return "Ticket[price=" + price + ", name=" + name + ", id=" + id + "]";
	}

}
