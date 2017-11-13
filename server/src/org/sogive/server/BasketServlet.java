package org.sogive.server;

import java.util.List;

import org.sogive.data.commercial.Basket;
import org.sogive.data.user.DBSoGive;
import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;
import org.sogive.server.payment.StripeAuth;
import org.sogive.server.payment.StripePlugin;

import com.stripe.model.Charge;
import com.sun.corba.se.impl.protocol.NotLocalLocalCRDImpl;
import com.winterwell.data.JThing;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;
import com.winterwell.youagain.client.AuthToken;
import com.winterwell.youagain.client.NoAuthException;
import com.winterwell.youagain.client.YouAgainClient;

public class BasketServlet extends CrudServlet<Basket> {

	public BasketServlet() {
		super(Basket.class);
	}

	@Override
	protected JThing<Basket> doPublish(WebRequest state) {
		// copy pasta from DonationServlet
		
		// make/save Donation
		super.doSave(state);
		Basket donation = (Basket) jthing.java();

		XId user = state.getUserId();
		if (user==null) {
			String email = state.get("stripeEmail");
			if (email==null && donation.getStripe()!=null) {
				email = (String) donation.getStripe().getEmail(); 
			}
			if (email==null) throw new NoAuthException("Stripe requires authentication to process a payment");
			user = new XId(email, "Email");
		}
		assert user != null;
		
		// take payment
		// TODO Less half-assed handling of Stripe exceptions
		try {
			String ikey = donation.getId();
			Person userObj = DBSoGive.getCreateUser(user);
			assert userObj != null : user;
			StripeAuth sa = donation.getStripe();
			if (sa==null) sa = new StripeAuth(userObj, state);
			else {
				// email??
				if (Utils.isBlank(sa.getEmail())) {					
					sa.setEmail(userObj.getEmail());
				}
				assert state==null || state.get("stripeToken")==null || state.get("stripeToken").equals(sa.token);
			}
			if (StripeAuth.SKIP_TOKEN.equals(sa.token)) {
				Log.w("Basket.payment", "Skip! "+state);
			} else {
				// Show me the money!
				Charge charge = StripePlugin.collect(donation.getTotal(), donation.getId(), sa, userObj, ikey);
				Log.d("stripe", charge);
				donation.setPaymentId(charge.getId());
				donation.setCollected(true);				
			}
		} catch(Exception e) {
			throw new RuntimeException(e);
		}
				
		// store in the database (this will save the edited basket)
		super.doPublish(state);
		
		// Process the order!
		BasketPublishedActor bpa = Dep.get(BasketPublishedActor.class);
		bpa.send(donation);
		
		return jthing;
	}
	
	@Override
	protected void doSecurityCheck(WebRequest state) throws SecurityException {
		// try to auth
		YouAgainClient ya = Dep.get(YouAgainClient.class);
		List<AuthToken> tokens = ya.getAuthTokens(state);
		// But can work without auth
		// TODO low-level safety against editing someone else's basket
	}
	
}
