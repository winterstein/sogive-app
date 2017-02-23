package org.sogive.server.payment;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.sogive.data.user.Donation;

import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.log.WeirdException;
import com.winterwell.web.fields.SField;
import com.stripe.Stripe;
import com.stripe.exception.APIConnectionException;
import com.stripe.exception.APIException;
import com.stripe.exception.AuthenticationException;
import com.stripe.exception.CardException;
import com.stripe.exception.InvalidRequestException;
import com.stripe.model.Customer;
import com.stripe.model.CustomerSubscriptionCollection;
import com.stripe.model.Subscription;
import com.stripe.net.RequestOptions;
import com.winterwell.utils.containers.ArrayMap;

/**
 * Take money from people.
 * @author daniel
 *
 */
public class StripePlugin {

	public static final String SERVICE = "stripe";

	static String SECRET_KEY;

	/**
	 * 
	 * @param gateway {id: stripe-customer-id}
	 * @throws Exception
	 */
	public static void cancelPlan(Map gateway) throws Exception {
		Log.i(SERVICE, "cancelPlan "+gateway);
		String id = (String) gateway.get("id");
		Stripe.apiKey = SECRET_KEY; // WTF? This method (but not it seems other Stripe methods) needs the key set at the global level!
		RequestOptions requestOptions = RequestOptions.builder().setApiKey(SECRET_KEY).build();
		Customer customer = Customer.retrieve(id, requestOptions);
		// TODO just cancel one plan
//		CustomerSubscriptionCollection subs = customer.getSubscriptions();
		customer.cancelSubscription(new ArrayMap(
				"at_period_end", true
				));
	}

	/**
	 * 
	 * @param map {id: customer-id}
	 * @return Can return null for unknown
	 */
	public static List<Subscription> checkSubscriptions(Map map) {
		try {
			String id = (String) map.get("id");
			RequestOptions requestOptions = RequestOptions.builder().setApiKey(SECRET_KEY).build();
			Customer customer = Customer.retrieve(id, requestOptions);
			CustomerSubscriptionCollection subs = customer.getSubscriptions();
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

	public static Map collect(Donation donation, StripeAuth sa, String idempotencyKey) {
		// https://stripe.com/docs/api#create_charge
//		String key = StripePlugin.SECRET_KEY;
//		// Charge them!
//		RequestOptions requestOptions = RequestOptions.builder().setApiKey(key).build();
//        Map<String, Object> chargeMap = new HashMap<String, Object>();
//        chargeMap.put("source", sa.token);
//        chargeMap.put("amount", plan);
//        description
//        metadata key value
//        receipt_email
//        customer id
//        statement_descriptor 22 chars
//        chargeMap.put("currency", currency);
//        chargeMap.put("email", email);
////        chargeMap.put("currency", "gbp");
//        
////        https://stripe.com/docs/api#idempotent_requests
////        add header Idempotency-Key:
//        	
//        Log.i(LOGTAG, "create-map:"+chargeMap+" params:"+state.getParameterMap());
//        Customer c = Customer.create(chargeMap, requestOptions);
//        Log.d(LOGTAG, c);

	}
	
}
