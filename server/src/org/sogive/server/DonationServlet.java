package org.sogive.server;

import org.sogive.data.user.Donation;
import org.sogive.server.payment.StripePlugin;

import com.winterwell.utils.TodoException;
import com.winterwell.web.WebEx;
import com.winterwell.web.app.WebRequest;

/**
 * TODO action=add-payment-method log stripe token 
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

	public void run() {
		if (state.actionIs("add-payment-method")) {
			doAddPaymentMethod();
		} else if (state.actionIs("make-donation")) {
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

	private void doMakeDonation() {
		Donation donation;
		StripePlugin.collect(donation)
		new Donation(from, to, ourFee, otherFees, giftAid, total)

	}

	private void doAddPaymentMethod() {
		// TODO Auto-generated method stub
		throw new TodoException();
	}

	
	
}
