package org.sogive.data.commercial;

import com.goodloop.data.Money;
import com.winterwell.data.AThing;
import com.winterwell.es.ESKeyword;
import com.winterwell.web.data.XId;

import lombok.Data;

/**
 * Hm: right now, Ticket.id is NOT unique!
 * @author daniel
 *
 */
@Data
public class Ticket extends AThing {

	/**
	 * Optional message from buyer to recipient
	 */
	String message;
	
	/**
	 * By default, if you buy several tickets, they use the same address. 
	 */
	Boolean sameAsFirst = true;
	
	/**
	 * defaults to the user's fundraiser page
	 */
	String postPurchaseLink;
	String postPurchaseCTA; 
	
	XId oxid;
	
	@ESKeyword
	String eventId;
	
	/** e.g. "a gentle 10 mile walk" 
	NB: name is the title, e.g. "Wee Wander" */
	String subtitle;

	/** Adult / Child / card (HACK: special value) */
	String kind;

	Money price;
	
	/**
	 * How many can we sell?
	 */
	Integer stock;
	Boolean inviteOnly; // TODO
	
	/**
	 * TODO how many have we sold??
	 * ?? do via DataLog or??
	 */
	Integer sold;
	
	
	String description;
	/** i.e. "Walker" */
	String attendeeNoun;
	/**
	 * "img" would have been a better name - oh well. Minor TODO rename
	 */
	String attendeeIcon;
	
	
	String attendeeName;
	
	@ESKeyword
	String attendeeEmail;
	String attendeeAddress;
	String team;
	
	@ESKeyword	
	String charityId;

	/**
	 * The parent Ticket ID, or null
	 */
	@ESKeyword	
	String parentId;

	@Override
	public String toString() {
		return "Ticket[price=" + price + ", name=" + name + ", id=" + id + "]";
	}

	public XId getOwnerXId() {
		return attendeeEmail==null? null : new XId(attendeeEmail, "email");
	}
	
	
}
