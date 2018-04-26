/**
 * 
 */
package org.sogive.data.commercial;

import java.util.List;
import java.util.Map;

import com.winterwell.data.AThing;

/**
 * @author daniel
 *
 */
public class Event extends AThing {
	
	List<Ticket> ticketTypes;
	/**
	 * merchandise: t-shirts, bus-tickets, etc.
	 */
	List<Ticket> extras;
	String date;
	/**
	 * 0 - 100
	 */
	private Integer matchedFunding;  
	/**
	 * If there is matched funding - who provides it?
	 */
	String matchedFundingSponsor;
	/**
	 * 
	 * @return [0, 1]
	 */
	public double getMatchedFunding() {
		if (matchedFunding==null) return 0;
		return matchedFunding / 100;
	}
	
	String logoImage;
	String bannerImage;
	/**
	 * A default for pages where the user hasn't uploaded anything
	 */
	String defaultFundraiserImg;
	String description;
	String backgroundImage;
	
	/**
	 * Event "features"
	 */
	Boolean teams;
	Boolean pickCharity;
	/**
	 * locked charity?
	 */
	String charityId;
	
}	
