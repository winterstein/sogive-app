package org.sogive.server;

import java.io.IOException;
import java.util.Map;

import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;
import org.sogive.data.user.DB;
import org.sogive.server.payment.StripeAuth;
import org.sogive.server.payment.StripePlugin;

import com.google.gson.Gson;
import com.stripe.model.Charge;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.UpdateRequestBuilder;
import com.winterwell.utils.Dependency;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;
import com.winterwell.web.fields.IntField;

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
		// curl 'http://local.sogive.org/donation' -H 'Cookie: JSESSIONID=xylenet95aiaj2gfi83otlqv' -H 'Origin: http://local.sogive.org' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: en-US,en;q=0.8' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'Accept: */*' -H 'Referer: http://local.sogive.org/' -H 'X-Requested-With: XMLHttpRequest' -H 'Connection: keep-alive' --data 'action=donate&charityId=sightsavers-royal-commonwealth-society-for-the-blind&currency=GBP&giftAid=false&total100=100000&stripeToken=tok_19qQiqLRMN0tOY9GUnBPP0xh&stripeTokenType=card&stripeEmail=roscoe.mcinerney%40gmail.com' --compressed
		// --data 'action=donate&charityId=sightsavers-royal-commonwealth-society-for-the-blind&
		// currency=GBP&giftAid=false&total100=100000&stripeToken=tok_19qQiqLRMN0tOY9GUnBPP0xh
		// &stripeTokenType=card&stripeEmail=roscoe.mcinerney%40gmail.com' --compressed
		XId user = state.getUserId();
		String email = state.get("stripeEmail");
		if (user==null && email!=null) {
			user = new XId(email, "Email");
		}			
		XId charity = new XId(state.get("charityId"), "sogive");
		String currency = state.get("currency");
		Integer total100 = state.get(new IntField("total100"));
		MonetaryAmount ourFee= null;
		MonetaryAmount otherFees= null;
		boolean giftAid = false;
		MonetaryAmount total= new MonetaryAmount(total100);
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
		Charge charge = StripePlugin.collect(donation, sa, userObj, ikey);
		
		Log.d("stripe", charge);
		donation.setCollected(true);
		donation.setPaymentId(charge.getId());
		
		// TODO store in the database
		UpdateRequestBuilder pu = es.prepareUpdate("donation", "donation", donation.getId());
		
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
