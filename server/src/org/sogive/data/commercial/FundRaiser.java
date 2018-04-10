package org.sogive.data.commercial;

import java.util.List;
import java.util.Map;

import org.sogive.data.charity.Money;
import org.sogive.data.charity.NGO;
import org.sogive.data.user.DBSoGive;
import org.sogive.data.user.Person;

import com.winterwell.data.AThing;
import com.winterwell.data.PersonLite;
import com.winterwell.data.PostLite;
import com.winterwell.es.IESRouter;
import com.winterwell.utils.Dep;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.web.app.AppUtils;
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
	/**
	 * user photo + name + bio
	 */
	PersonLite owner;
	String description;
	Money target = Money.pound(100);
	Money userTarget = Money.pound(100);
	Money donated = Money.pound(0);
	Integer donationCount;
	String charityId;
	/**
	 * The user's personal story
	 */
	String story;
	
	List<PostLite> updates;
	
	public String img;
	/**
	 * store the ticket for audit
	 */
	Ticket ticket;
	
	public Ticket getTicket() {
		return ticket;
	}

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
		assert ticket.getOwnerXId() != null: ticket;
		// NB: hash with salt to protect the users email
		return ticket.getEventId()+'.'+StrUtils.md5("user:"+ticket.getOwnerXId());	
	}

	public FundRaiser() {
	}
	
	public FundRaiser(Ticket ticket, Basket basket) {
		setId(getIDForTicket(ticket));		
		// charity
		charityId = Utils.or(ticket.charityId, basket.charityId); 
		eventId = Utils.or(ticket.eventId, basket.eventId);
		oxid = ticket.getOwnerXId();
		Map info = new ArrayMap(
				"name", ticket.attendeeName
				);
		owner = AppUtils.getCreatePersonLite(oxid, info);
		this.ticket = ticket;		
		// name
		Event event = getEvent();		
		if (event==null) {
			NGO charity = AppUtils.get(charityId, NGO.class);
			if (charity==null) {
				Log.e("FundRaiser.new", "no valid charity or event?! "+this);
				setName(owner.getName()+"'s fund-raiser");	
			} else {
				setName(owner.getName()+"'s fund-raiser for "+charity.getDisplayName());
			}			
		} else {
			setName(owner.getName()+"'s "+event.name);
		}
	}

	/**
	 * @return Can be null if the fundraiser is directly for the charity with no ticketed event.
	 */
	public Event getEvent() {
		if (eventId==null) return null;
		Event event = AppUtils.get(eventId, Event.class);
		return event;
	}
	
}
