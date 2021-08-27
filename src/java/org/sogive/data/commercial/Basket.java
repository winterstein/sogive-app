package org.sogive.data.commercial;

import java.util.List;

import org.sogive.server.payment.IForSale;
import org.sogive.server.payment.StripeAuth;

import com.goodloop.data.Money;
import com.winterwell.data.AThing;
import com.winterwell.ical.Repeat;
import com.winterwell.web.data.XId;

/**
 * The NORMAL status for a Basket is DRAFT!
 * 
 * PUBLISHED => this Basket has been paid for (ie it is now an order).
 * 
 * @author daniel
 *
 */
public class Basket extends AThing implements IForSale {

	/**
	 * a convenience for setting the per-ticket values.
	 */
	String charityId;

	/**
	 * Whether we think payment has been collected. Note that Stripe can reclaim
	 * money, we we have to allow a period before counting this as firm.
	 */
	boolean collected;

	/**
	 * a convenience for setting the per-ticket values.
	 */
	String eventId;

	/**
	 * true when we have delivered the items (or done whatever we need to do).
	 */
	boolean fulfilled;

	/**
	 * Remember whether the user wanted to add a tip
	 */
	boolean hasTip;

	List<Ticket> items;

	XId oxid;

	/**
	 * e.g. a stripe charge id
	 */
	String paymentId;

	String repeat;

	/**
	 * Stripe token etc
	 */
	StripeAuth stripe;

	/**
	 * If we've collected payment for this basket we should have a Stripe token
	 */
	String stripeToken;
	/**
	 * Optional gratuity to cover SoGive's operating costs
	 */
	Money tip;

	public Money getAmount() {
		if (items == null)
			return Money.pound(0);
		Money ttl = Money.pound(0.0);
		for (Ticket ticket : items) {
			if (ticket.getPrice() == null)
				continue;
			ttl = new Money(ttl.plus(ticket.getPrice()));
		}
		if (hasTip && tip != null) {
			ttl = new Money(ttl.plus(tip));
		}
		return ttl;
	}
	public String getCharityId() {
		return charityId;
	}

	@Override
	public String getDescription() {
		return "Charity " + getCharityId() + " Event " + eventId + " Items " + items.size();
	}

	public String getEventId() {
		return eventId;
	}

	public List<Ticket> getItems() {
		return items;
	}
	@Override
	public boolean getPaymentCollected() {
		return collected;
	}

	@Override
	public Repeat getRepeat() {
		return repeatFromString(repeat, null); // no stop date
	}

	public StripeAuth getStripe() {
		return stripe;
	}

	public void setCharityId(String charityId) {
		this.charityId = charityId;
	}

	public void setItems(List<Ticket> items) {
		this.items = items;
	}

	@Override
	public void setPaymentCollected(boolean b) {
		this.collected = b;
	}

	public void setPaymentId(String paymentId) {
		this.paymentId = paymentId;
	}

}
