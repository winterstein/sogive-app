package org.sogive.server.payment;

import java.util.Map;

import org.sogive.data.commercial.Basket;
import org.sogive.data.user.Person;

import com.winterwell.utils.Utils;
import com.winterwell.web.app.WebRequest;

import lombok.Data;

/**
 * Token for a Customer
 * @author daniel
 *
 */
@Data
public class StripeAuth {

	public static final String SKIP_TOKEN = "skip_token";
	public StripeAuth() {	
	}
	
	public StripeAuth(Person userObj, WebRequest state) {		
		if (state!=null) {
			id = state.get("stripeToken");
			type = state.get("stripeTokenType");
			email = state.get("stripeEmail");
		}
		if (userObj!=null) {
			Map stripe = (Map) userObj.get("stripe");
			if (stripe!=null) {
				customerId = state.get("customerId"); // @Roscoe - is this right, or should it be stripe.get()?? ^DW
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

}
