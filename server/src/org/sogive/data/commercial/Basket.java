package org.sogive.data.commercial;

import java.util.List;
import java.util.Map;

import org.sogive.data.charity.Money;
import org.sogive.data.charity.NGO;
import org.sogive.server.payment.StripeAuth;

import com.winterwell.data.AThing;
import com.winterwell.utils.Mutable;

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
public class Basket extends AThing {

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

	public Money getTotal() {
		if (items==null) return Money.pound(0);
		Money ttl = Money.pound(0.0);
		for (Ticket ticket : items) {
			if (ticket.getPrice()==null) continue;
			ttl = ttl.plus(ticket.getPrice());
		}
		if (hasTip && tip != null) {
			ttl = ttl.plus(tip);
		}
		return ttl;
	}

}
