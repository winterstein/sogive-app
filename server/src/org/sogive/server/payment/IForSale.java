package org.sogive.server.payment;

import org.sogive.data.charity.Money;

public interface IForSale {

	StripeAuth getStripe();


	/**
	 * the total to be paid for.
	 * This does include tips and taxes.
	 * It does not include post-sale components (like matched donations).
	 */
	Money getAmount();

	String getId();

	void setPaymentId(String id);

	void setPaymentCollected(boolean b);

}
