package org.sogive.data.commercial;

import org.sogive.data.charity.MonetaryAmount;

import com.winterwell.data.AThing;

import lombok.Data;

@Data
public class Ticket extends AThing {

	/**
	 * By default, if you buy several tickets, they use the same address. 
	 */
	Boolean sameAsFirst = true;
	
	String eventId;
	
	/** e.g. "a gentle 1o mile walk" 
	NB: name is the title, e.g. "Wee Wander" */
	String subtitle;

	/** Adult / Child */
	String kind;

	MonetaryAmount price;
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
	
	
}
