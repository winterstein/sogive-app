package org.sogive.server.payment;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.eclipse.jetty.util.ajax.JSON;
import com.goodloop.data.Money;
import org.sogive.data.user.Person;

import com.stripe.Stripe;
import com.stripe.model.Charge;
import com.stripe.model.Customer;
//import com.stripe.model.CustomerSubscriptionCollection;
import com.stripe.model.Subscription;
import com.stripe.model.SubscriptionCollection;
import com.stripe.net.RequestOptions;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.log.Log;

/**
 * Take money from people.
 * @author daniel
 *
 */
public class StripePlugin {

	public static final String SERVICE = "stripe";
	private static final String LOGTAG = "stripe";

//	/**
//	 * 
//	 * @param gateway {id: stripe-customer-id}
//	 * @throws Exception
//	 */
//	public static void cancelPlan(Map gateway) throws Exception {
//		Log.i(SERVICE, "cancelPlan "+gateway);
//		String id = (String) gateway.get("id");
//		String secretKey = Dep.get(StripeConfig.class).secretKey;
//		Stripe.apiKey = secretKey; // WTF? This method (but not it seems other Stripe methods) needs the key set at the global level!
//		RequestOptions requestOptions = RequestOptions.builder().setApiKey(secretKey).build();
//		Customer customer = Customer.retrieve(id, requestOptions);
//		// TODO just cancel one plan
////		CustomerSubscriptionCollection subs = customer.getSubscriptions();
//		customer.cancelSubscription(new ArrayMap(
//				"at_period_end", true
//				));
//	}

	/**
	 * 
	 * @param map {id: customer-id}
	 * @return Can return null for unknown
	 */
	public static List<Subscription> checkSubscriptions(Map map) {
		try {
			String id = (String) map.get("id");
			String secretKey = Dep.get(StripeConfig.class).secretKey;
			RequestOptions requestOptions = RequestOptions.builder().setApiKey(secretKey).build();
			Customer customer = Customer.retrieve(id, requestOptions);
			SubscriptionCollection subs = customer.getSubscriptions();
			if (subs==null || subs.getData().isEmpty()) { // bug seen Dec 2015 When/why does this happen?
				// It might be when we create a test account, then remove them from Stripe!
				return null;
			}
			List<Subscription> subsl = subs.getData();
			return subsl;
		} catch(Exception ex) {
			throw Utils.runtime(ex);
		}
	}

	/**
	 * 
	 * @param amount
	 * @param description
	 * @param sa
	 * @param user
	 * @param idempotencyKey E.g. the Donation or Basket id. Repeated calls with the same i-key _within 24 hours_ should be harmless.
	 * See https://stripe.com/docs/api#idempotent_requests
	 * @return
	 * @throws Exception
	 */
	public static Charge collect(Money amount, String description, StripeAuth sa, Person user, String idempotencyKey) 
			throws Exception
	{
		Log.d("stripe", amount+" "+description+" "+sa+" "+user+" "+idempotencyKey);
		if (amount.getValue100p() <= 0) {
			throw new IllegalArgumentException(amount.toString());
		}
		// https://stripe.com/docs/api#create_charge
		String secretKey = secretKey();
//		// Charge them!
		Stripe.apiKey = secretKey;
//		RequestOptions requestOptions = RequestOptions.builder().setApiKey(secretKey).build();
        Map<String, Object> chargeMap = new HashMap<String, Object>();        
        // pence, rounding up
        int pence = (int) Math.ceil(amount.getValue100p() / 100);
        chargeMap.put("amount", pence);
        chargeMap.put("description", description); // ??
//        metadata key value
        chargeMap.put("receipt_email", sa.email);
        chargeMap.put("customer", sa.customerId);
        chargeMap.put("source", sa.id);
        chargeMap.put("statement_descriptor", "Donation via SoGive"); // max 22 chars
        chargeMap.put("currency", Utils.or(amount.getCurrency(), "GBP"));
        
        Log.i(LOGTAG, "create-map:"+chargeMap);
        // blank entries upset Stripe
        for(String k : chargeMap.keySet().toArray(new String[0])) {
        	Object val = chargeMap.get(k);
        	if (val == null) {
        		chargeMap.remove(k);
        		continue;
        	}
        	if (val instanceof String && Utils.isBlank((String)val)) {
        		chargeMap.remove(k);
        	}
        }
        
//      https://stripe.com/docs/api#idempotent_requests
//		add header Idempotency-Key:
        RequestOptions ro = null;
        if (Utils.isBlank(idempotencyKey)) {
        	Log.w(LOGTAG, "No idempotency-key protection for charge "+chargeMap);
        } else {
        	ro = RequestOptions.getDefault().toBuilder().setIdempotencyKey(idempotencyKey).build();
        }

        // Charge!!
        Charge c = Charge.create(chargeMap, ro);

        //        Customer c = Customer.create(chargeMap, requestOptions);
        Log.d(LOGTAG, "A charge was made! "+c);
        if (user!=null && c.getCustomer() != null) {
        	Customer cobj = c.getCustomerObject();
	        user.put("stripe", new ArrayMap(
	        			"customerId", c.getCustomer(),
	        			"email", cobj==null? c.getReceiptEmail() : cobj.getEmail()
	        		));
        }
        // TODO turn into a map
		return c;
	}

	public static String secretKey() {		
		StripeConfig stripeConfig = Dep.get(StripeConfig.class);
		Log.d("stripe.setup", JSON.toString(stripeConfig));
		if (stripeConfig.testStripe) {
			String skey = stripeConfig.testSecretKey;
			assert skey != null : "No Stripe TEST secret key :(";
			return skey;
		}
		String skey = stripeConfig.secretKey;
		assert skey != null : "No Stripe secret key :(";
		return skey;
	}

	/**
	 * set the secret key
	 */
	public static void prep() {
		Utils.check4null(secretKey(), "Stripe secretKey");
		Stripe.apiKey = secretKey();		
	}
	
}
