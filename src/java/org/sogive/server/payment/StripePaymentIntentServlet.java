package org.sogive.server.payment;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.ApiResource;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentUpdateParams;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;

/**
 * /stripe/webhook
 * @author daniel
 *
 */
public class StripePaymentIntentServlet implements IServlet {


	public void process(WebRequest state) throws Exception {		
		String amtString = state.get("amount");
		Long amt;
		try {
			amt = Long.parseLong(amtString);
		} catch (NumberFormatException e) {
			WebUtils2.sendError(400, "Missing required field \"amt\" (amount of payment in pence)", state.getResponse());
			return;
		}
		// Are we updating an existing PaymentRequest?
		String oldId = state.get("id");
		
		StripePlugin.prep();
		
		try {
			PaymentIntent intent;
			
			if (oldId != null) {
				intent = PaymentIntent.retrieve(oldId);
				PaymentIntentUpdateParams params = PaymentIntentUpdateParams.builder()
						.setAmount(amt)
						.build();
				intent = intent.update(params);
			} else {
				// See https://stripe.com/docs/api/payment_intents/create
				PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
						.setAmount(amt)
						.setCurrency("gbp")
						.addPaymentMethodType("card")
						.build();
				intent = PaymentIntent.create(params);
			}
						
			JsonResponse output = new JsonResponse(state);
			Map<String, String> cargo = new HashMap<String, String>();
			cargo.put("clientSecret", intent.getClientSecret());
			cargo.put("id", intent.getId());
			output.setCargo(cargo);
			
			WebUtils2.sendJson(output, state);
			
			return;
		} catch (StripeException e) {
			WebUtils2.sendError(500, "Stripe error: " + e.getLocalizedMessage(), state.getResponse());
		}
	}
}