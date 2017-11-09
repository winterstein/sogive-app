package org.sogive.server;

import static org.junit.Assert.*;

import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.eclipse.jetty.util.ajax.JSON;
import org.junit.Test;
import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.commercial.Basket;
import org.sogive.data.commercial.Event;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.commercial.Ticket;
import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;
import org.sogive.server.payment.StripePlugin;

import com.stripe.Stripe;
import com.stripe.model.Token;
import com.winterwell.datalog.server.TrackingPixelServlet;
import com.winterwell.gson.FlexiGson;
import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Printer;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.web.FakeBrowser;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;
import com.winterwell.web.test.TestHttpServletRequest;
import com.winterwell.web.test.TestHttpServletResponse;
import com.winterwell.youagain.client.AuthToken;
import com.winterwell.youagain.data.DBAuth;

/**
 * TODO Integration test for {@link BasketServlet}
 * 
 * @author daniel
 *
 */
public class BasketServletTest {

	@Test
	public void testRegister() {
		// fire up a server
		String host = SoGiveTestUtils.getStartServer();
				
		String tokenId = null;
		String tokenType = null;
		try {
			Stripe.apiKey = StripePlugin.secretKey();
			
			Token tok = new DonationServletTest().getFreshToken(new DonationServletTest().getTokenParams());
			tokenId = tok.getId();
			tokenType = tok.getType();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
		
		
		// make a save + publish call with test Stripe details	
		// Do use a temp XId
		WebRequest state = new WebRequest(new TestHttpServletRequest(), new TestHttpServletResponse());
		String id = TrackingPixelServlet.getCreateCookieTrackerId(state);
		XId from = new XId(id);
		String to = SoGiveTestUtils.getCharity().getId();
		MonetaryAmount userContribution = MonetaryAmount.pound(3);
		
		Event event = SoGiveTestUtils.getTestEvent();
		
		Basket basket = new Basket();
		basket.id = "testBasketFor"+id;
		// 1 ticket for spoon
		Ticket ticket = new Ticket();
		ticket.id = event.id+".foo";
		ticket.name = "Adult Ticket";
		ticket.setPrice(MonetaryAmount.pound(2.5));
		ticket.setAttendeeEmail("spoonmcguffin@gmail.com");		
		basket.setItems(Arrays.asList(ticket));
		
		String donj = Dep.get(Gson.class).toJson(basket);
		FakeBrowser fb = new FakeBrowser();
		fb.setRequestMethod("PUT");
		try {
			String json= fb.getPage(host+"/basket/"+WebUtils.urlEncode(basket.id)+".json", 
					new ArrayMap(
							"stripeEmail", "spoonmcguffin@gmail.com",
							"stripeToken", tokenId, 
							"stripeTokenType", tokenType, 
							"item", donj, 
							"action", CrudServlet.ACTION_PUBLISH
							)
					);
			Map response = (Map) JSON.parse(json);
			Map esres = (Map) response.get("cargo");
			
			System.out.println(esres);
			Basket don2 = Dep.get(Gson.class).fromJson(JSON.toString(esres));
			System.out.println(don2);
			
			// TODO check a fund-raiser page is made
			// TODO check a welcome email is sent -- Mockito the email sending
			
		} catch(Exception ex) { // allow us to breakpoint w/o a time out killing the JVM
			ex.printStackTrace();
		}	
	}
		
}
