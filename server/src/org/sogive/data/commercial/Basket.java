package org.sogive.data.commercial;

import java.util.List;

import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.charity.NGO;

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
	List<Ticket> items;
	
	String charity;
	
	/**
	 * Whether we think payment has been collected. 
	 * Note that Stripe can reclaim money, we we have to allow a period before
	 * counting this as firm.
	 */
	boolean collected;
	
	/**
	 * true when we have delivered the items (or done whatever we need to do).
	 */
	boolean fulfilled;
	
	/**
	 * e.g. a stripe charge id
	 */
	String paymentId;

	public MonetaryAmount getTotal() {
		if (items==null) return MonetaryAmount.pound(0);
		Mutable.Ref<MonetaryAmount> ttl = new Mutable.Ref(MonetaryAmount.pound(0));
		items.stream().map(item -> item.getPrice()).filter(p -> p!=null)
			.map(p -> ttl.value = ttl.value.plus(p));
		// tax??
		return ttl.value;
	}

}
