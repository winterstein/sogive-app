package org.sogive.server.payment;

import java.util.Map;

import org.sogive.data.user.Person;

import com.winterwell.web.app.WebRequest;

/**
 * Token for a Customer
 * @author daniel
 *
 */
public class StripeAuth {

	public StripeAuth(Person userObj, WebRequest state) {
		if (state!=null) {
			token = state.get("stripeToken");
			email = state.get("stripeEmail");
			tokenType = state.get("stripeTokenType");
		}
		if (userObj!=null) {
			Map stripe = (Map) userObj.get("stripe");
			if (stripe!=null) {
				customerId = state.get("customerId");
				if (email==null) {
					email = userObj.getEmail();
				}
			}
		}
	}
	
	String customerId;
	String token;
	String tokenType;
	String email;		

}
