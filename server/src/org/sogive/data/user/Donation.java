package org.sogive.data.user;

import java.util.List;
import java.util.Map;

import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.charity.Output;

import com.winterwell.data.AThing;
import com.winterwell.utils.Utils;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.web.data.XId;

public class Donation extends AThing {

	String from;
	
	String to;
	
	String donorName;
	String donorAddress;
	String donorPostcode;
	
	public MonetaryAmount getTotal() {
		return total;
	}
	

	/**
	 * Whether we think this has been collected. 
	 * Note that Stripe can reclaim money, we we have to allow a period before
	 * counting this as firm.
	 */
	boolean collected;
	
	boolean paidOut;
	
	/**
	 * e.g. a stripe charge id
	 */
	String paymentId;
	
	public void setPaymentId(String paymentId) {
		this.paymentId = paymentId;
	}
	
	MonetaryAmount transfer;
	
	MonetaryAmount ourFee;
	
	MonetaryAmount otherFees;

	boolean giftAid;
	boolean giftAidTaxpayer;
	boolean giftAidOwnMoney;
	boolean giftAidNoCompensation;
	
	
	MonetaryAmount total;

	/**
	 * When this donation was made
	 */
	String date = new Time().toISOString();

	private List<Output> impacts;


	public Donation(XId from, XId to, MonetaryAmount ourFee, MonetaryAmount otherFees, boolean giftAid,
			MonetaryAmount total) {
		Utils.check4null(from, to, total);
		this.from = from.toString();
		this.to = to.toString();
		this.ourFee = ourFee;
		this.otherFees = otherFees;
		this.giftAid = giftAid;
		this.total = total;
		if (ourFee!=null && otherFees!=null) {
			transfer = total.minus(ourFee).minus(otherFees);
		}
		// HACK: make an ID to block repeats within a couple of minutes
		long tmin = new Time(date).getTime() / (5*TUnit.MINUTE.millisecs);
		this.id = total.getValue100()+" "+from+" to "+to+" at "+(tmin);
	}

	public String getId() {
		return id;
	}

	public void setCollected(boolean b) {
		this.collected = b;
	}
	
	/**
	 * from - who provided this. There can be multiple sources
	 *  - e.g. if a bot infers the data, then both bot and original source should be listed here.
	 *  
	 * NB: see Claim.java in profiler
	 */
	XId[] f;
	
	/**
	 * The app that created this - e.g. sogive or goodloop.
	 */
	String a;

	@Override
	public String toString() {
		return "Donation[from=" + from + ", to=" + to + ", total=" + total + ", time=" + date + "]";
	}

	public void setImpacts(List<Output> impacts) {
		this.impacts = impacts;
	}

	public void setGiftAid(String name, String address, String postcode) {
		Utils.check4null(name, address, postcode);
		this.donorName = name;
		this.donorAddress = address;
		this.donorPostcode = postcode;
	}
	
	

}
