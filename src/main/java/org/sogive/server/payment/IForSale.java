package org.sogive.server.payment;

import com.goodloop.data.Money;
import com.winterwell.ical.Repeat;
import com.winterwell.utils.Utils;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;

public interface IForSale {

	/**
	 * the total to be paid for. This does include tips and taxes. It does not
	 * include post-sale components (like matched donations).
	 */
	Money getAmount();

	String getDescription();

	String getId();

	boolean getPaymentCollected();

	Repeat getRepeat();

	StripeAuth getStripe();

	default Repeat repeatFromString(String repeat, Time optionalStopDate) {
		if (repeat == null || "one-off".equalsIgnoreCase(repeat) ||
		// false, off, OFF
				!Utils.yes(repeat, false)) {
			return null;
		}
		// NB: repeat must be valid if we're here
		String sfreq = Repeat.freqForTUnit(TUnit.valueOf(repeat));
		String rrule = "FREQ=" + sfreq + ";";
		if (optionalStopDate != null) {
			rrule += "UNTIL=" + optionalStopDate.format("yyyyMMdd") + ";"; // not iso format :(
		}
		Repeat repeater = new Repeat(rrule);
		return repeater;
	}

	void setPaymentCollected(boolean b);

	void setPaymentId(String id);

}
