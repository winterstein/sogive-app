/**
 * 
 */
package org.sogive.data.commercial;

import java.util.List;

import com.goodloop.data.Money;
import com.winterwell.data.AThing;
import com.winterwell.es.ESKeyword;
import com.winterwell.utils.time.Time;

/**
 * E.g. a sponsored run
 * @author daniel
 *
 */
public class Event extends AThing {
	
	/**
	 * ISO3166 country code
	 */
	@ESKeyword
	String country;
	
	/**
	 * Events can have per-person (attendee) fundraising targets, and whole-event targets.
	 * This is independent from paid tickets.
	 */
	Money perPersonTarget = Money.pound(10);
	
	List<SuggestedDonation> suggestedDonations;
	
	/**
	 * Should people be able to create ongoing donations, e.g. monthly and extending after the event?
	 */
	Boolean allowOngoingDonations;
	
	/**
	 * status NOT used
	 */
	Money target = Money.pound(100);
	
	String customCSS;
	
	/**
	 * NB: no ticketTypes = no-one can register. Use this to close an event.
	 */
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
		return matchedFunding.doubleValue() / 100;
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
	/**
	 * Allow the participants to pick their own charity
	 */
	Boolean pickCharity;
	
	/**
	 * If set, the organiser will get name and email details for all donors. Donors will be informed of this when making a donation.
	 */
	Boolean shareDonorsWithOrganiser;
	
	/**
	 * Set to charity-id if this event is locked to a charity. 
	 * @see {@link #pickCharity}
	 */
	String charityId;	
	
	public Time getDate() {
		return date==null? null : new Time(date);
	}

	public String getCharityId() {
		return charityId;
	}
	
}	
