package org.sogive.server;

import java.io.IOException;

import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.user.Donation;
import org.sogive.server.payment.StripePlugin;

import com.winterwell.utils.TodoException;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;

/**
 * TODO action=donate 
 * 
 * TODO log stripe token 
 * 
 * TODO make donation
 * 
 * TODO list donations
 * 
 * @author daniel
 *
 */
public class DonationServlet {

	private WebRequest state;

	public DonationServlet(WebRequest request) {
		this.state = request;
	}

	public void run() throws IOException {
		if (state.actionIs("donate")) {
			doMakeDonation();
		} else if (state.getSlug()!=null && state.getSlug().contains("list")) {
			doList();
		} else {
			throw new WebEx(400, "What did you want?");
		}
	}

	private void doList() {
		// TODO Auto-generated method stub
		throw new TodoException();
	}

	private void doMakeDonation() throws IOException {
		XId user = state.getUserId();
		XId charity = null;
		MonetaryAmount ourFee= null;
		MonetaryAmount otherFees= null;
		boolean giftAid = false;
		MonetaryAmount total= null;
		Donation donation = new Donation(user, charity, ourFee, otherFees, giftAid, total);

		// TODO store in the database
		
		StripePlugin.collect(donation);
		
		// TODO store in the database
		
		JsonResponse output = new JsonResponse(state, donation);
		WebUtils2.sendJson(output, state);
	}

	private void doAddPaymentMethod() {
		// TODO Auto-generated method stub
		throw new TodoException();
	}

	
	
}
