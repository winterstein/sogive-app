package org.sogive.server.payment;

import com.winterwell.utils.log.Log;
import com.winterwell.web.app.WebRequest;
import com.stripe.model.Event;
import com.stripe.net.APIResource;

/**
 * /stripe/webhook
 * @author daniel
 *
 */
public class StripeWebhookServlet {

	private WebRequest state;

	public void process(WebRequest state) throws Exception {
		this.state = state;
		// Retrieve the request's body and parse it as JSON
		Event eventJson = APIResource.GSON.fromJson(state.getPostBody(), Event.class);
		Log.d("stripe", "json: "+state.getPostBody());
		// Do something with eventJson??
		Log.d("stripe", eventJson.getType()+" "+eventJson.getData());
	}
	
}
