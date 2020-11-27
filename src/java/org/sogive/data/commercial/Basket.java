package org.sogive.data.commercial;

import java.util.List;

import org.sogive.server.payment.IForSale;
import org.sogive.server.payment.StripeAuth;

import com.goodloop.data.Money;
import com.winterwell.data.AThing;
import com.winterwell.ical.Repeat;
import com.winterwell.web.data.XId;

import lombok.Data;

/**
 * The NORMAL status for a Basket is DRAFT!
 * 
 * PUBLISHED => this Basket has been paid for (ie it is now an order).
 * 
 * @author daniel
 *
 */
@Data
public class Basket extends AThing implements IForSale {
	
	XId oxid;

	/**
	 * Stripe token etc
	 */
	StripeAuth stripe;
	
	List<Ticket> items;
	
	/**
	 * a convenience for setting the per-ticket values.
	 */
	String eventId;
	/**
	 * a convenience for setting the per-ticket values.
	 */
	String charityId;
	
	/**
	 * Whether we think payment has been collected. 
	 * Note that Stripe can reclaim money, we we have to allow a period before
	 * counting this as firm.
	 */
	boolean collected;
	/**
	 * If we've collected payment for this basket we should have a Stripe token
	 */
	String stripeToken;
	
	/**
	 * true when we have delivered the items (or done whatever we need to do).
	 */
	boolean fulfilled;
	
	/**
	 * e.g. a stripe charge id
	 */
	String paymentId;
	
	/**
	 * Optional gratuity to cover SoGive's operating costs
	 */
	Money tip;
	/**
	 * Remember whether the user wanted to add a tip
	 */
	boolean hasTip;
	
	@Override
	public String getDescription() {
		return "Charity "+getCharityId()+" Event "+eventId+" Items "+items.size();
	}

	public Money getAmount() {
		if (items==null) return Money.pound(0);
		Money ttl = Money.pound(0.0);
		for (Ticket ticket : items) {
			if (ticket.getPrice()==null) continue;
			ttl = new Money(ttl.plus(ticket.getPrice()));
		}
		if (hasTip && tip != null) {
			ttl = new Money(ttl.plus(tip));
		}
		return ttl;
	}

	@Override
	public void setPaymentCollected(boolean b) {
		this.collected = b;
	}

	@Override
	public boolean getPaymentCollected() {
		return collected;
	}

	String repeat;
	
	@Override
	public Repeat getRepeat() {
		return repeatFromString(repeat, null); // no stop date
	}

}
