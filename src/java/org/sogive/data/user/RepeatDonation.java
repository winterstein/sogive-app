package org.sogive.data.user;

import org.sogive.data.commercial.Event;

import com.goodloop.data.Money;
import com.winterwell.data.AThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESKeyword;
import com.winterwell.ical.ICalEvent;
import com.winterwell.ical.Repeat;
import com.winterwell.utils.AString;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.data.XId;

import lombok.Data;

/**
 * Use ical code
 * @author daniel
 *
 */
@Data
public class RepeatDonation extends AThing {
	
	private static final String LOGTAG = "RepeatDonation";
	
	Money amount;
	/**
	 * donation id
	 */
	String did;
	
	/**
	 * The user who donated
	 */
	final XId from;
	

	public ICalEvent ical = new ICalEvent();

	@ESKeyword
	private String to;

	@ESKeyword
	private String fundRaiser;

	/**
	 * created time
	 */
	private Time date;

	public RepeatDonation(Donation donation) {
		super();
		date = donation.getTime();
		id = idForDonation(donation);
		did = donation.getId();
		amount = donation.getAmount();
		fundRaiser = donation.getFundRaiser();
		to = donation.getTo();
		from = donation.getFrom();
		ical.start = donation.getTime();		
		// NB: repeat must be valid if we're here
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
		ical.setRepeat(repeater);		
	}


	public static String idForDonation(Donation donation) {
		return "repeat"+donation.getId();
	}

	@Override
	public String toString() {
		return "RepeatDonation[amount=" + amount + ", did=" + did + ", ical=" + ical + "]";
	}


	public Donation newDraftDonation() {		
		Donation don0 = AppUtils.get(did, Donation.class);
		Utils.check4null(from, to, don0, this);
		org.sogive.data.charity.Money uc = don0.getRawAmount();
		Donation don = new Donation(from, to, uc);
		// NB: we cant just copy DOnation as that includes various processing flags :(
		don.setA(don0.getA());
		// NB: various settings are left blank as not needed in a repeat
		don.setDonorAddress(don0.getDonorAddress());
		don.setDonorEmail(don0.getDonorEmail());
		don.setDonorName(don0.getDonorName());
		don.setDonorPostcode(don0.getDonorPostcode());
		Event event = don0.getEvent();		
		don.setEvent(event);
//		don.setF(f);
//		don.setFees(fees); // is this set by the payment processor?? Ditto for contibutions??
		don.setFundRaiser(don0.getFundRaiser());
		don.setGiftAid(don0.getGiftAid());
		don.setGenerator(id);
		don.setHasTip(don0.hasTip);		
		don.setImpacts(don0.getImpacts());
		don.setPaymentMethod(don0.getPaymentMethod());
		don.setStripe(don0.getStripe()); // ?? it'd be good if payment handling could update
		don.setTip(don0.getTip());		
		don.setVia(don0.getVia());
		
		don.setStatus(KStatus.DRAFT);
		return don;
	}


	boolean done;
	
}
