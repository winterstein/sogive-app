package org.sogive.data.user;

import com.goodloop.data.Money;
import com.winterwell.data.AThing;
import com.winterwell.ical.ICalEvent;
import com.winterwell.ical.Repeat;

/**
 * Use ical code
 * @author daniel
 *
 */
public class RepeatDonation extends AThing {
	
	Money amount;
	/**
	 * donation id
	 */
	String did;

	public ICalEvent ical = new ICalEvent();

	public RepeatDonation(Donation donation) {
		super();
		id = idForDonation(donation);
		did = donation.getId();
		ical.start = donation.getTime();
		
		String rrule = "FREQ="+donation.repeat.toUpperCase()+";";
		if (donation.repeatUntil != null) {
			rrule += "UNTIL="+repeatUntil.toISOStringDateOnly()+";";
		}
		Repeat repeater = new Repeat(rrule);
		ical.repeat = repeater;
	}

	public static String idForDonation(Donation donation) {
		return "repeat"+donation.getId();
	}
}
