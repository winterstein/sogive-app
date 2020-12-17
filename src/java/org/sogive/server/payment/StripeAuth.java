package org.sogive.server.payment;

import java.util.Map;

import org.sogive.data.user.Person;

import com.winterwell.utils.Utils;
import com.winterwell.web.app.WebRequest;

import lombok.Data;

/**
 * Token or Source for a Customer
 * @author daniel
 *
 */
@Data
public class StripeAuth {

	public static final String SKIP_TOKEN = "skip_token";
	public static final String credit_token = "credit_token";
	
	public StripeAuth() {	
	}
	
	/**
	 * 
	 * @param userObj
	 * @param state Can be null.
	 */
	public StripeAuth(Person userObj, WebRequest state) {
		assert userObj!=null || state!=null;
		if (state!=null) {
			id = state.get("stripeToken");
			type = state.get("stripeTokenType");
			email = state.get("stripeEmail");
		}
		if (userObj!=null) {
			Map stripe = (Map) userObj.get("stripe");
			if (stripe!=null) {
				// where does this info live??
				String cid = (String) Utils.or(state.get("customerId"), stripe.get("customerId"));
				if (cid!=null) setCustomerId(cid);
			}
			if (email==null) {
				email = userObj.getEmail();
			}
		}
		// what is the min info needed?
		if (Utils.isBlank(customerId) && Utils.isBlank(email) && Utils.isBlank(id)) {
			throw new IllegalArgumentException("Not enough info for a Stripe charge: "+userObj+" "+state);
		}
	}
	/**
	 *  The token ID
	 */
	public String id;
	/**
	 *  The token type - usually "card"
	 */
	String type;
	/**
	 * "token" or "source"?
	 */
	String object;
	
	/**
	 * live or test?
	 */
	Boolean livemode;
	
	/**
	 * ??
	 */
	String client_secret;
	
	/**
	 *  Customer info, may be blank
	 */
	String customerId;
		
	String email;
	/**
	 * Stripe-sanitised card details
	 * Useful fields:
	 * last4: last four digits
	 * exp_month, exp_year: expiry
	 * brand: eg "Visa"
	 * country: two-letter code
	 */
	Map<String, Object> card;
	/** SOurce only (not token)
	 * 
	 * address
email
name
phone
verified_address
verified_email
verified_name
verified_phone
	 */
	Map<String, Object> owner;
	
	/**
	 * ??
	 */
	String statement_descriptor;
	
	/**
	 * Time when this authorisation was created
	 * (NB: Stored as epoch seconds, not ms)
	 */
	String created;
	
	@Override
	public String toString() {
		// paranoia - dont leak money tokens into logs
		String tkn = null;
		if (id!=null) {
			if (SKIP_TOKEN.equals(id)) tkn = SKIP_TOKEN;
			else tkn = "XXX";
		}
		return "StripeAuth[customerId=" + customerId + ", tokenId=" +tkn+ ", tokenType=" + type + ", email="
				+ email + "]";
	}

	/** @return true if this is a (probably reusable) money source */
	public boolean isSource() {
		return "source".equals(object);
	}
	
	/** @return true if this is a PaymentMethod (should be all StripeAuths after Dec 2020 API migration) */
	public boolean isPaymentMethod() {
		return "payment_method".equals(object);
	}

}
