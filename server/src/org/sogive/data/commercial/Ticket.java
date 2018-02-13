package org.sogive.data.commercial;

import org.sogive.data.charity.Money;

import com.winterwell.data.AThing;
import com.winterwell.web.data.XId;

import lombok.Data;

@Data
public class Ticket extends AThing {

	/**
	 * By default, if you buy several tickets, they use the same address. 
	 */
	Boolean sameAsFirst = true;
	
	String eventId;
	
	/** e.g. "a gentle 10 mile walk" 
	NB: name is the title, e.g. "Wee Wander" */
	String subtitle;

	/** Adult / Child */
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
	// i.e. "Walker"
	String attendeeNoun;
	String attendeeIcon;
	
	
	String attendeeName;
	String attendeeEmail;
	String attendeeAddress;
	String team;
	String charityId;

	@Override
	public String toString() {
		return "Ticket[price=" + price + ", name=" + name + ", id=" + id + "]";
	}

	public XId getOwnerXId() {
		return attendeeEmail==null? null : new XId(attendeeEmail, "email");
	}
	
	
}
