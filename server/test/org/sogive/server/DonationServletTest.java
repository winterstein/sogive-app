package org.sogive.server;

import static org.junit.Assert.*;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.eclipse.jetty.util.ajax.JSON;
import org.junit.Test;
import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.commercial.FundRaiser;
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
 * Integration test for {@link DonationServlet}
 * 
 * @author daniel
 *
 */
public class DonationServletTest {

	@Test
	public void testMakeDonationNotLoggedIn() {
		// fire up a server
		String host = SoGiveTestUtils.getStartServer();
				
		String tokenId = null;
		String tokenType = null;
		try {
			Stripe.apiKey = StripePlugin.secretKey();
			
			Token tok = getFreshToken(getTokenParams());
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
		
		Donation don = new Donation(from, to, userContribution);
		don.setA("test");
		String did = don.getId();
		
		
		String donj = Dep.get(Gson.class).toJson(don);
		FakeBrowser fb = new FakeBrowser();
		fb.setRequestMethod("PUT");
		try {
			String json= fb.getPage(host+"/donation/"+WebUtils.urlEncode(did)+".json", 
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
			Donation don2 = Dep.get(Gson.class).fromJson(JSON.toString(esres));
			System.out.println(don2);
		} catch(Exception ex) { // allow us to breakpoint w/o a time out killing the JVM
			ex.printStackTrace();
		}	
	}

	/**
	 * Assemble a Map of parameters which can be used in a (test mode) Stripe request to create a fresh token.
	 * Copy-pasted from Stripe's own test suite.
	 * @return
	 */
	Map<String, Object> getTokenParams() {
		// Expiry date can be whatever as long as it's (a) reasonable and (b) no earlier than the current month+year.
		int expYear = Calendar.getInstance().get(Calendar.YEAR);
		
		Map<String, Object> tokenParams = new HashMap<String, Object>();
		Map<String, Object> cardParams = new HashMap<String, Object>();
		cardParams.put("number", "4000008260000000"); // Using the UK Visa test card number
		cardParams.put("exp_month", 12);
		cardParams.put("exp_year", expYear);
		cardParams.put("cvc", "666");
		tokenParams.put("card", cardParams);

		return tokenParams;
	}
	
	Token getFreshToken(Map<String, Object> params) throws Exception {
		return Token.create(params);
	}
	
	@Test
	public void testMakeDonation_ToFundRaiser_LoggedIn() {
		// fire up a server
		String host = SoGiveTestUtils.getStartServer();
		
		AuthToken user = SoGiveTestUtils.doTestUserLogin(host);
		Person walker = SoGiveTestUtils.doTestWalker();
		
		FundRaiser fr = SoGiveTestUtils.getTestFundRaiser();
		
		String tokenId = null;
		String tokenType = null;
		try {
			Stripe.apiKey = StripePlugin.secretKey();
			
			Token tok = getFreshToken(getTokenParams());
			tokenId = tok.getId();
			tokenType = tok.getType();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
		
		
		// make a save + publish call with test Stripe details
		
		XId from = user.xid;
		String to = SoGiveTestUtils.getCharity().getId();
		MonetaryAmount userContribution = MonetaryAmount.pound(2);
		
		Donation don = new Donation(from, to, userContribution);
		don.setA("test");
		don.setFundRaiser(fr.id);
		don.setVia(new XId(walker.getId()));
		String did = don.getId();
		
		
		String donj = Dep.get(Gson.class).toJson(don);
		FakeBrowser fb = new FakeBrowser();
		fb.setRequestMethod("PUT");
		fb.setAuthenticationByJWT(user.getToken());
		try {
			String json= fb.getPage(host+"/donation/"+WebUtils.urlEncode(did)+".json", 
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
			Donation don2 = Dep.get(Gson.class).fromJson(JSON.toString(esres));
			System.out.println(don2);
		} catch(Exception ex) { // allow us to breakpoint w/o a time out killing the JVM
			ex.printStackTrace();
		}
		// check the DB
		// check Stripe
	}
	
	
	@Test
	public void testListForFundRaiser() {
		// fire up a server
		String host = SoGiveTestUtils.getStartServer();
		
		FundRaiser fr = SoGiveTestUtils.getTestFundRaiser();
		
		FakeBrowser fb = new FakeBrowser();
		String listjson = fb.getPage(host+"/donation/list.json", new ArrayMap(
				"q", "fundRaiser:"+fr.id
				));
		Map response = (Map) JSON.parse(listjson);
		Map esres = (Map) response.get("cargo");
		List<Map> hits = Containers.asList(esres.get("hits"));
		Printer.out(hits);
		assert hits.size() != 0; // the other tests should make donations for this to find
		hits.forEach(hit -> {
			assert fr.id.equals(hit.get("fundRaiser"));	
		});
	}
}
