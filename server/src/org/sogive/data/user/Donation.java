package org.sogive.data.user;

import org.sogive.data.charity.MonetaryAmount;

import com.winterwell.utils.Utils;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.web.data.XId;

public class Donation {

	String id;

	XId from;
	
	XId to;
	
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
	
	String trackerId;
	
	MonetaryAmount transfer;
	
	MonetaryAmount ourFee;
	
	MonetaryAmount otherFees;

	boolean giftAid;
	
	MonetaryAmount total;

	/**
	 * When this donation was made
	 */
	Time time = new Time();

	public Donation(XId from, XId to, MonetaryAmount ourFee, MonetaryAmount otherFees, boolean giftAid,
			MonetaryAmount total) {
		Utils.check4null(from, to, total);
		this.from = from;
		this.to = to;
		this.ourFee = ourFee;
		this.otherFees = otherFees;
		this.giftAid = giftAid;
		this.total = total;
		if (ourFee!=null && otherFees!=null) {
			transfer = total.minus(ourFee).minus(otherFees);
		}
		// make an ID to block repeats
		long tmin = time.getTime() / TUnit.MINUTE.millisecs;
		this.id = total.getValue100()+" "+from+" to "+to+" at "+(tmin);
	}

	public String getId() {
		return id;
	}

	public void setCollected(boolean b) {
		this.collected = b;
	}

	@Override
	public String toString() {
		return "Donation[from=" + from + ", to=" + to + ", total=" + total + ", time=" + time + "]";
	}
	
	

}
