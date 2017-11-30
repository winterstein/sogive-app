package org.sogive.data.commercial;


import java.util.List;

import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.charity.Output;
import org.sogive.data.user.Donation;
import org.sogive.server.payment.StripeAuth;

import com.winterwell.data.AThing;
import com.winterwell.data.PersonLite;
import com.winterwell.utils.Mutable;
import com.winterwell.utils.Utils;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.web.data.XId;

import lombok.Data;

/**
* A lightweight object for maintaining an accounting audit trail
* This corresponds to a simple credit-debit transaction in double-entry
* book-keeping.
* 
* This is similar to {@link Donation}, and intentionally uses same field names.
* <p>
* // TODO some audit information - who made this transfer and how
	// Perhaps this is provided by associated events?
	// for every transfer, emit an event where that transfer is the instrument?
* 
* TODO support for currency conversion? just the bald fact of two money amounts?
* or conversion can be modelled more directly me £10-> bank, bank $15-> you
* TODO a status field for pending, published=normal, trash=cancelled?
* TODO debt vs payment
* @author Dan, joe
*/
@Data
public class Transfer extends AThing {
	String note;

	/**
	 * Providing the money
	 */
	XId from;
	
	/**
	 * Receiving the money
	 */
	XId to;
	
	String message;
		
	
	/**
	 * The total amount the `to` will receive.
	 */
	public MonetaryAmount getTotal() {
		Mutable.Ref<MonetaryAmount> ttl = new Mutable.Ref<>(amount);
//		if (contributions!=null) contributions.forEach(c -> ttl.value = ttl.value.plus(c));
		if (fees!=null) fees.forEach(c -> ttl.value = ttl.value.minus(c));
		total = ttl.value;
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
	 * If true, the money was paid outside of the SoGive system.
	 * E.g. cash paid in directly. Then this record is just to log the donation in SoGive.
	 */
	boolean paidElsewhere;
	
	/**
	 * e.g. a stripe charge id
	 */
	String paymentId;
	
	StripeAuth stripe;

	/**
	 * Our fees + processing fees.
	 */
	List<MonetaryAmount> fees;
	
	/**
	 * The user's contribution
	 */
	MonetaryAmount amount;
		
	/**
	 * The total amount the charity will receive.
	 */
	MonetaryAmount total;	

	/**
	 * When this donation was made
	 */
	String date = new Time().toISOString();

	public Transfer(XId from, XId to, MonetaryAmount amount) {
		Utils.check4null(from, to);
		this.from = from;
		this.to = to;
		this.amount = amount;
		// HACK: make an ID to block repeats within a couple of minutes
		long tmin = new Time(date).getTime() / (5*TUnit.MINUTE.millisecs);
		this.id = amount.getValue()+" from "+from+" to "+to+" at "+(tmin);
	}

	public String getId() {
		return id;
	}

	public void setCollected(boolean b) {
		this.collected = b;
	}
	
	/**
	 * from - who provided this info. There can be multiple sources
	 *  - e.g. if a bot infers the data, then both bot and original source should be listed here.
	 *  
	 * NB: see Claim.java in profiler
	 */
	XId[] f;
	
	/**
	 * The app that created this - e.g. sogive or goodloop.
	 */
	String a;


}
