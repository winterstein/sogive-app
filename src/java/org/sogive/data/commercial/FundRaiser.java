package org.sogive.data.commercial;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.goodloop.data.Money;
import org.sogive.data.charity.NGO;
import org.sogive.data.user.Person;

import com.winterwell.data.AThing;
import com.winterwell.data.PersonLite;
import com.winterwell.data.PostLite;
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
	/**
	 * fund-raising target
	 */
	Money target = Money.pound(100);
	
	/**
	 * target set by the user (takes precedence)
	 */
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
	
	/**
	 * Donation IDs -- for debugging purposes
	 */
	List<String> donations = new ArrayList<>();
		
	public List<String> getDonations() {
		if (donations==null) donations = new ArrayList(); // backfill old objects
		return donations;
	}
	
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
	 * Important: this is copied in js!!
	 * @param ticket
	 * @return
	 */
	public static String getIDForTicket(Ticket ticket) {
		assert ! Utils.isBlank(ticket.getEventId()) : "no event?! "+ticket;
		assert ticket.getOwnerXId() != null: ticket;
		// pick a "nice" but unique id - e.g. daniel.moonwalk.uydx
		String uname = ticket.getOwnerXId().getName();
		// avoid exposing the persons email
		if (uname.contains("@")) uname = uname.substring(0, uname.indexOf("@"));
		// so repeat calls give the same answer (no random), but it should be unique enough
		String hashme = uname+ticket.getId();
		String predictableNonce = StrUtils.md5(hashme).substring(0, 6);
		String safeuname = uname.replaceAll("\\W+", "");
		return safeuname+'.'+ticket.getEventId()+'.'+predictableNonce;	
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
			// target?
			if (event.perPersonTarget != null) {
				Log.d(LOGTAG(), "set target "+event.perPersonTarget+" for "+this);
				setTarget(new Money(event.perPersonTarget));
				// set recommended donation??
			}
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
