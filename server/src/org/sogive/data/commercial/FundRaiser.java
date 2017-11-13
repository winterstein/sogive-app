package org.sogive.data.commercial;

import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.charity.NGO;
import org.sogive.data.user.Person;

import com.winterwell.data.AThing;
import com.winterwell.data.PersonLite;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.web.data.XId;

import lombok.Data;

/**
 * Mostly the info is contained in {@link Event} and {@link Person},
 * but not entirely. Hence this data object
 * @author daniel
 *
 */
@Data
public class FundRaiser extends AThing {
	String eventId;
	XId oxid;
	PersonLite owner;
	String description;
	MonetaryAmount target;
	MonetaryAmount donated;
	Integer donationCount;
	String charityId;
	
	public String img;

	@Override
	public void init() {
		super.init();
		// set url from ID
		getUrl();
	}
	
	@Override
	public String getUrl() {
		// set from ID?
		if (url==null && id!=null) {
			url = "https://app.sogive.org/#fundraiser/"+WebUtils.urlEncode(getId());
		}
		return url;
	}
	
	/**
	 * Important: this is copied in js
	 * @param ticket
	 * @return
	 */
	public static String getIDForTicket(Ticket ticket) {
		assert ! Utils.isBlank(ticket.getEventId()) : "no event?! "+ticket;
		assert ! Utils.isBlank(ticket.attendeeEmail): ticket;
		// NB: hash with salt to protect the users email
		return ticket.getEventId()+'.'+StrUtils.md5("user:"+ticket.attendeeEmail);	
	}

	public FundRaiser() {
	}
	public FundRaiser(Ticket ticket, Basket basket) {		
		setId(getIDForTicket(ticket));
		// charity
		charityId = Utils.or(ticket.charityId, basket.charityId); 
	}
	
}
