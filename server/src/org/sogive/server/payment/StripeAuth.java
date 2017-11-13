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
			token = state.get("stripeToken");
			email = state.get("stripeEmail");
			tokenType = state.get("stripeTokenType");
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
		if (Utils.isBlank(customerId) && Utils.isBlank(email) && Utils.isBlank(token)) {
			throw new IllegalArgumentException("Not enough info for a Stripe charge: "+userObj+" "+state);
		}
	}
	
	String customerId;
	public String token;
	String tokenType;
	String email;
	
	@Override
	public String toString() {
		// paranoia - dont leak money tokens into logs
		String tkn = null;
		if (token!=null) {
			if (SKIP_TOKEN.equals(token)) tkn = SKIP_TOKEN;
			else tkn = "XXX";
		}
		return "StripeAuth[customerId=" + customerId + ", token=" +tkn+ ", tokenType=" + tokenType + ", email="
				+ email + "]";
	}		

}
