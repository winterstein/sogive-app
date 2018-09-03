package org.sogive.server.payment;

import com.winterwell.utils.log.Log;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.stripe.model.Event;
import com.stripe.net.ApiResource;

/**
 * /stripe/webhook
 * @author daniel
 *
 */
public class StripeWebhookServlet implements IServlet {

	private WebRequest state;

	public void process(WebRequest _state) throws Exception {
		this.state = _state;
		// Retrieve the request's body and parse it as JSON
		Event eventJson = ApiResource.GSON.fromJson(state.getPostBody(), Event.class);
		Log.d("stripe", "json: "+state.getPostBody());
		// Do something with eventJson??
		Log.d("stripe", eventJson.getType()+" "+eventJson.getData());
	}
	
}
