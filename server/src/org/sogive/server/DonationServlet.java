package org.sogive.server;

import java.io.IOException;

import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;
import org.sogive.data.user.DB;
import org.sogive.server.payment.StripeAuth;
import org.sogive.server.payment.StripePlugin;

import com.google.gson.Gson;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.UpdateRequestBuilder;
import com.winterwell.utils.Dependency;
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

	public void run() throws Exception {
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

	private void doMakeDonation() throws Exception {
		XId user = state.getUserId();
		XId charity = new XId(state.get("charityId"), "sogive");
		MonetaryAmount ourFee= null;
		MonetaryAmount otherFees= null;
		boolean giftAid = false;
		MonetaryAmount total= null;
		Donation donation = new Donation(user, charity, ourFee, otherFees, giftAid, total);

		// Store in the database (acts as a form of lock)
		ESHttpClient es = Dependency.get(ESHttpClient.class);
		IndexRequestBuilder pi = es.prepareIndex("donation", "donation", donation.getId());
//		pi.setRefresh("true"); TODO
//		pi.setOpTypeCreate(true);		
		String json = Dependency.get(Gson.class).toJson(donation);
		pi.setSource(json);
		IESResponse res = pi.get().check();
		String json2 = res.getJson();
		
		// check we haven't done before: done by the op_type=create
		Person userObj = DB.getUser(user);
		String ikey = donation.getId();
		StripeAuth sa = new StripeAuth(userObj, state);
		// collect the money
		Object customer = StripePlugin.collect(donation, sa, userObj, ikey);
		
		// TODO store in the database
		UpdateRequestBuilder pu = es.prepareUpdate("donation", "donation", donation.getId());
		donation.setCollected(true);
		String json3 = Dependency.get(Gson.class).toJson(donation);
		pu.setSource(json);
		IESResponse resAfter = pu.get().check();
		String json4 = res.getJson();		
		
		JsonResponse output = new JsonResponse(state, donation);
		WebUtils2.sendJson(output, state);
	}

	private void doAddPaymentMethod() {
		// TODO Auto-generated method stub
		throw new TodoException();
	}

	
	
}
