package org.sogive.server.payment;

import com.stripe.model.Event;
import com.stripe.net.ApiResource;
import com.winterwell.utils.log.Log;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;

/**
 * /stripe/webhook
 * 
 * @author daniel
 *
 */
public class StripeWebhookServlet implements IServlet {

	private WebRequest state;

	public void process(WebRequest _state) throws Exception {
		this.state = _state;
		Log.d("StripeWebhookServlet", _state);
		// Retrieve the request's body and parse it as JSON
		Event eventJson = ApiResource.GSON.fromJson(state.getPostBody(), Event.class);
		Log.d("StripeWebhookServlet", "json: " + state.getPostBody());
		// Do something with eventJson??
		Log.d("StripeWebhookServlet", eventJson.getType() + " " + eventJson.getData());
	}

}
