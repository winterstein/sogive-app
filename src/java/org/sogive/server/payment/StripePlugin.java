package org.sogive.server.payment;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.eclipse.jetty.util.ajax.JSON;
import org.sogive.data.user.Person;

import com.goodloop.data.Money;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;
//import com.stripe.model.CustomerSubscriptionCollection;
import com.stripe.model.Subscription;
import com.stripe.model.SubscriptionCollection;
import com.stripe.net.RequestOptions;
import com.stripe.param.PaymentIntentCreateParams;
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
	public static Charge collectLegacy(Money amount, String description, StripeAuth sa, Person user, String idempotencyKey) 
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
        	Map cInfo = new ArrayMap(
    			"customerId", c.getCustomer(),
				"email", cobj==null? c.getReceiptEmail() : cobj.getEmail()
    		);
	        user.put("stripe", cInfo);
        }
        // TODO turn into a map
		return c;
	}
	
	public static PaymentIntent collect(Money amount, String description, StripeAuth sa, Person user, String idempotencyKey) 
			throws Exception
	{
		Log.d("stripe", amount+" "+description+" "+sa+" "+user+" "+idempotencyKey);
		if (amount.getValue100p() <= 0) {
			throw new IllegalArgumentException(amount.toString());
		}
		
		// Amount to charge in pence (rounding up before casting to int)
		Long pence = (long) Math.ceil(amount.getValue100p() / 100);
		String currency = Utils.or(amount.getCurrency(), "GBP").toString();
		
		StripePlugin.prep();
		// Get whatever payment method was originally used
		PaymentMethod pm = paymentMethodFromStripeAuth(sa);
		// and ask for a new PaymentIntent using it
		PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
				.setCurrency(currency)
				.setAmount(pence)
				.setPaymentMethod(pm.getId())
				.setCustomer(pm.getCustomer())
				.setConfirm(true) // ?? (from migration docs)
				.setOffSession(true) // The customer is not present to confirm payment (so you'd better have run SCA and got permission for repeat payments)
				.setStatementDescriptor("Donation via SoGive") // To appear on credit card statement
				.setDescription(description) // Our internal description
				.setReceiptEmail(sa.email)
				.build();

//		Add idempotency key to request (https://stripe.com/docs/api#idempotent_requests)
        RequestOptions ro = null;
        if (Utils.isBlank(idempotencyKey)) {
        	Log.w(LOGTAG, "No idempotency-key protection for PaymentIntent " + params);
        } else {
        	ro = RequestOptions.builder().setIdempotencyKey(idempotencyKey).build();
        }

        PaymentIntent pi = PaymentIntent.create(params, ro);

        Log.d(LOGTAG, "A PaymentIntent was created! " + pi);
        if (user != null && pi.getCustomer() != null) {
        	Customer cobj = pi.getCustomerObject();
        	Map cInfo = new ArrayMap(
    			"customerId", pi.getCustomer(),
    			"email", cobj == null ? pi.getReceiptEmail() : cobj.getEmail()
    		);
	        user.put("stripe", cInfo);
        }
        // TODO turn into a map
		return pi;
	}
	
	/**
	 * A StripeAuth created after the 2020-12 update may contain an ID for a PaymentIntent or a PaymentMethod.
	 * To make a new payment we always need the PaymentMethod - this abstracts away the extra retrieval steps. 
	 * @param sa
	 * @return
	 * @throws StripeException
	 */
	public static PaymentMethod paymentMethodFromStripeAuth(StripeAuth sa) throws StripeException {
		PaymentMethod pm = null;
		if (sa.isPaymentIntent()) {
			PaymentIntent pi = PaymentIntent.retrieve(sa.getId());
			pm = PaymentMethod.retrieve(pi.getPaymentMethod());
		} else if (sa.isPaymentMethod()) {
			pm = PaymentMethod.retrieve(sa.getId());
		}
		return pm;
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
