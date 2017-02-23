package org.sogive.server.payment;

import org.sogive.data.user.Person;

import com.winterwell.web.app.WebRequest;

/**
 * Token for a Customer
 * @author daniel
 *
 */
public class StripeAuth {

	public StripeAuth(Person userObj, WebRequest state) {
		// TODO Auto-generated constructor stub
	}
	
	String customerId;
	String token;
	String tokenType;
	String email;		

}
