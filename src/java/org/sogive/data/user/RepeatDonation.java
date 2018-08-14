package org.sogive.data.user;

import org.sogive.data.commercial.Event;

import com.goodloop.data.Money;
import com.winterwell.data.AThing;
import com.winterwell.es.ESKeyword;
import com.winterwell.ical.ICalEvent;
import com.winterwell.ical.Repeat;
import com.winterwell.utils.AString;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.time.TUnit;
import com.winterwell.web.data.XId;

/**
 * Use ical code
 * @author daniel
 *
 */
public class RepeatDonation extends AThing {
	
	public static final class Id extends AString {
		public Id(CharSequence name) {
			super(name);
		}
		private static final long serialVersionUID = 1L;		
	}

	private static final String LOGTAG = "RepeatDonation";
	
	Money amount;
	/**
	 * donation id
	 */
	String did;
	
	/**
	 * The user who donated
	 */
	XId from;
	

	public ICalEvent ical = new ICalEvent();

	@ESKeyword
	private String to;

	private XId via;

	public RepeatDonation(Donation donation) {
		super();
		id = idForDonation(donation);
		did = donation.getId();
		amount = donation.getAmount();
		via = donation.getVia();
		to = donation.getTo();
		ical.start = donation.getTime();
		
		String sfreq = Repeat.freqForTUnit(TUnit.valueOf(donation.repeat));
		String rrule = "FREQ="+sfreq+";";
		if (Utils.yes(donation.repeatStopsAfterEvent)) {
			Event event = donation.getEvent();
			if (event != null && event.getDate()!=null) {
				rrule += "UNTIL="+event.getDate().format("yyyyMMdd")+";"; // not iso format :(
			} else {
				Log.e(LOGTAG, "Could not apply event stop date "+donation+" with event: "+event);
			}
		}
		Repeat repeater = new Repeat(rrule);
		ical.repeat = repeater;
	}


	public static String idForDonation(Donation donation) {
		return "repeat"+donation.getId();
	}

	@Override
	public String toString() {
		return "RepeatDonation[amount=" + amount + ", did=" + did + ", ical=" + ical + "]";
	}
	
}
