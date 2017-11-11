package org.sogive.server;

import org.sogive.data.commercial.Basket;
import org.sogive.data.user.DBSoGive;
import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;
import org.sogive.server.payment.StripeAuth;
import org.sogive.server.payment.StripePlugin;

import com.stripe.model.Charge;
import com.winterwell.data.JThing;
import com.winterwell.utils.Dep;
import com.winterwell.utils.log.Log;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;

public class BasketServlet extends CrudServlet<Basket> {

	public BasketServlet() {
		super(Basket.class);
	}

	@Override
	protected JThing<Basket> doPublish(WebRequest state) {
		// copy pasta from DonationServlet
		XId user = state.getUserId();
		String email = state.get("stripeEmail");
		if (user==null && email!=null) {
			user = new XId(email, "Email");
		}
		
		// make/save Donation
		super.doSave(state);
		Basket donation = (Basket) jthing.java();
		
		// take payment
		String ikey = donation.getId();
		Person userObj = DBSoGive.getUser(user);
		StripeAuth sa = new StripeAuth(userObj, state);
		// collect the money
		// TODO Less half-assed handling of Stripe exceptions
		try {
			Charge charge = StripePlugin.collect(donation.getTotal(), donation.getId(), sa, userObj, ikey);
			Log.d("stripe", charge);
			donation.setPaymentId(charge.getId());
			donation.setCollected(true);
			
			// store in the database
			super.doPublish(state);
			
			// Process the order!
			BasketPublishedActor bpa = Dep.get(BasketPublishedActor.class);
			bpa.send(donation);
			
			return jthing;
		} catch(Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	@Override
	protected void doSecurityCheck(WebRequest state) throws SecurityException {
//		super.doSecurityCheck(state);
		// can work without auth
		// TODO low-level safety against editing someone else's basket
	}
	
}
