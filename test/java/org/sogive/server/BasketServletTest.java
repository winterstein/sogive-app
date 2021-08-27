package org.sogive.server;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.junit.Test;
import org.sogive.data.commercial.Basket;
import org.sogive.data.commercial.Event;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.commercial.Ticket;
import org.sogive.server.payment.StripePlugin;

import com.goodloop.data.Money;
import com.stripe.Stripe;
import com.stripe.model.Token;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.FakeBrowser;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.data.XId;
import com.winterwell.web.email.SimpleMessage;
import com.winterwell.youagain.client.AuthToken;

/**
 * TODO Integration test for {@link BasketServlet}
 * 
 * @author daniel
 *
 */
public class BasketServletTest {

	@Test
	public void testBuy() {
		// fire up a server
		String host = SoGiveTestUtils.getStartServer();

		// fake email
		final List<SimpleMessage> sent = SoGiveTestUtils.mockEmailer();

		String tokenId = null;
		String tokenType = null;
		try {
			Stripe.apiKey = StripePlugin.secretKey();

			Token tok = new DonationServletTest().getFreshToken(new DonationServletTest().getTokenParams());
			tokenId = tok.getId();
			tokenType = tok.getType();
		} catch (Exception ex) {
			ex.printStackTrace();
		}

		// make a save + publish call with test Stripe details
		// NB: by this stage, the user is logged in
		AuthToken user = SoGiveTestUtils.doTestUserLogin(host);
		XId from = user.xid;

		Event event = SoGiveTestUtils.getTestEvent();

		Basket basket = new Basket();
		basket.id = "testBasketFor" + user.xid;
		// 1 ticket for spoon
		Ticket ticket = new Ticket();
		ticket.id = event.id + ".foo";
		ticket.setEventId(event.getId());
		ticket.name = "Adult Ticket";
		ticket.setPrice(Money.pound(2.5));
		ticket.setAttendeeName("Spoon");
		ticket.setAttendeeEmail("spoonmcguffin@gmail.com");
		basket.setItems(Arrays.asList(ticket));
		// charity gets copied into the tickets
		String to = SoGiveTestUtils.getCharity().getId();
		basket.setCharityId(to);

		String donj = Dep.get(Gson.class).toJson(basket);
		FakeBrowser fb = new FakeBrowser();
		fb.setRequestMethod("PUT");
		try {
			String json = fb.getPage(host + "/basket/" + WebUtils.urlEncode(basket.id) + ".json",
					new ArrayMap("stripeEmail", "spoonmcguffin@gmail.com", "stripeToken", tokenId, "stripeTokenType",
							tokenType, "item", donj, "action", CrudServlet.ACTION_PUBLISH));
			Map response = (Map) WebUtils2.parseJSON(json);
			Map esres = (Map) response.get("cargo");

			System.out.println(esres);
			Basket don2 = Dep.get(Gson.class).fromJson(WebUtils2.generateJSON(esres));
			System.out.println(don2);

			// check a fund-raiser page is made
			Utils.sleep(1500);
			String frid = FundRaiser.getIDForTicket(ticket);
			ESPath path = Dep.get(IESRouter.class).getPath(FundRaiser.class, frid);
			FundRaiser fr = AppUtils.get(path, FundRaiser.class);
			assert fr != null;

			// check a welcome email is sent -- Mockito the email sending
			assert sent.size() == 1 : sent;
			System.out.println(sent);

		} catch (Exception ex) { // allow us to breakpoint w/o a time out killing the JVM
			ex.printStackTrace();
		}
	}

}
