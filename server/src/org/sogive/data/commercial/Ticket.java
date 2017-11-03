package org.sogive.data.commercial;

import org.sogive.data.charity.MonetaryAmount;

import com.winterwell.data.AThing;

public class Ticket extends AThing {

	MonetaryAmount price;
	String description;
	// i.e. "Walker"
	String attendeeNoun;
	
	String attendeeName;
	String attendeeEmail;
	String attendeeAddress;

	@Override
	public String toString() {
		return "Product[price=" + price + ", name=" + name + ", id=" + id + "]";
	}
	
	
}
