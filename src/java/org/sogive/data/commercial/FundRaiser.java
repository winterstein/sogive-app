package org.sogive.data.commercial;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.sogive.data.charity.NGO;
import org.sogive.data.user.Person;

import com.goodloop.data.Money;
import com.winterwell.data.AThing;
import com.winterwell.data.PersonLite;
import com.winterwell.data.PostLite;
import com.winterwell.es.ESKeyword;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.data.XId;

/**
 * Mostly the info is contained in {@link Event} and {@link Person}, but not
 * entirely. Hence this data object
 * 
 * @author daniel
 *
 */
public class FundRaiser extends AThing {

	/**
	 * Important: this is copied in js!!
	 * 
	 * @param ticket
	 * @return
	 */
	public static String getIDForTicket(Ticket ticket) {
		assert !Utils.isBlank(ticket.getEventId()) : "no event?! " + ticket;
		assert ticket.getOwnerXId() != null : ticket;
		// pick a "nice" but unique id - e.g. daniel.moonwalk.uydx
		String uname = ticket.getOwnerXId().getName();
		// avoid exposing the persons email
		if (uname.contains("@"))
			uname = uname.substring(0, uname.indexOf("@"));
		// so repeat calls give the same answer (no random), but it should be unique
		// enough
		String hashme = uname + ticket.getId();
		String predictableNonce = StrUtils.md5(hashme).substring(0, 6);
		String safeuname = uname.replaceAll("\\W+", "");
		return safeuname + '.' + ticket.getEventId() + '.' + predictableNonce;
	}
	@ESKeyword
	String charityId;
	String description;
	Money donated = Money.pound(0);
	Integer donationCount;

	/**
	 * Donation IDs -- for debugging purposes
	 */
	List<String> donations = new ArrayList<>();
	@ESKeyword
	String eventId;

	public String img;
	/**
	 * user photo + name + bio
	 */
	PersonLite owner;

	/**
	 * The user's personal story
	 */
	String story;

	/**
	 * fund-raising target
	 */
	Money target = Money.pound(100);
	/**
	 * store the ticket for audit
	 */
	Ticket ticket;

	List<PostLite> updates;

	/**
	 * target set by the user (takes precedence)
	 */
	Money userTarget = Money.pound(100);

	public FundRaiser() {
	}

	public FundRaiser(Ticket ticket, Basket basket) {
		setId(getIDForTicket(ticket));
		// charity
		charityId = Utils.or(ticket.charityId, basket.charityId);
		eventId = Utils.or(ticket.eventId, basket.eventId);
		oxid = ticket.getOwnerXId();
		Map info = new ArrayMap("name", ticket.attendeeName);
		owner = AppUtils.getCreatePersonLite(oxid, info);
		this.ticket = ticket;
		// name
		Event event = getEvent();
		if (event == null) {
			NGO charity = AppUtils.get(charityId, NGO.class);
			if (charity == null) {
				Log.e("FundRaiser.new", "no valid charity or event?! " + this);
				setName(owner.getName() + "'s fund-raiser");
			} else {
				setName(owner.getName() + "'s fund-raiser for " + charity.getDisplayName());
			}
		} else {
			setName(owner.getName() + "'s " + event.name);
			// target?
			if (event.perPersonTarget != null) {
				Log.d(LOGTAG(), "set target " + event.perPersonTarget + " for " + this);
				setTarget(new Money(event.perPersonTarget));
				// set recommended donation??
			}
		}
	}

	public String getCharityId() {
		return charityId;
	}

	public Money getDonated() {
		return donated;
	}

	public Integer getDonationCount() {
		return donationCount;
	}

	public List<String> getDonations() {
		if (donations == null)
			donations = new ArrayList(); // backfill old objects
		return donations;
	}

	/**
	 * @return Can be null if the fundraiser is directly for the charity with no
	 *         ticketed event.
	 */
	public Event getEvent() {
		if (eventId == null)
			return null;
		Event event = AppUtils.get(eventId, Event.class);
		return event;
	}

	public Ticket getTicket() {
		return ticket;
	}

	@Override
	public String getUrl() {
		// set from ID?
		if (url == null && id != null) {
			url = "https://app.sogive.org/#fundraiser/" + WebUtils.urlEncode(getId());
		}
		return url;
	}

	@Override
	public void init() {
		super.init();
		// set url from ID
		getUrl();
	}

	public void setDonated(Money donated) {
		this.donated = donated;
	}

	public void setDonationCount(Integer donationCount) {
		this.donationCount = donationCount;
	}

	public void setEventId(String eventId) {
		this.eventId = eventId;
	}

	public void setOwner(PersonLite owner) {
		this.owner = owner;
		setOxid(owner == null ? null : owner.getXId());
	}

	public void setOxid(XId oxid) {
		this.oxid = oxid;
	}

	public void setTarget(Money target) {
		this.target = target;
	}

}
