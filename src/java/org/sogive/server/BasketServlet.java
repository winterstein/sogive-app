package org.sogive.server;

import java.util.ArrayList;
import java.util.List;

import org.sogive.data.DBSoGive;
import org.sogive.data.charity.NGO;
import org.sogive.data.commercial.Basket;
import org.sogive.data.commercial.Ticket;
import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;
import org.sogive.server.payment.MoneyCollector;
import org.sogive.server.payment.StripeAuth;
import org.sogive.server.payment.StripePlugin;

import com.stripe.model.Charge;
import com.stripe.model.Event;
import com.sun.corba.se.impl.protocol.NotLocalLocalCRDImpl;
import com.winterwell.web.ajax.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.client.KRefresh;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.web.app.AppUtils;
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
	protected JThing<org.sogive.data.commercial.Basket> doPublish(WebRequest state, KRefresh forceRefresh,
			boolean deleteDraft) 
	{
		Basket basket = getThing(state);
		if (basket==null) {
			jthing = getThingFromDB(state);
		}
		// copy pasta from DonationServlet
		// make/save Donation
		super.doSave(state);
		Basket donation = basket;

		String email = DonationServlet.getEmail(state, basket);
		XId user = state.getUserId();		
		if (user==null) {
			if (email==null) throw new NoAuthException("Stripe requires authentication to process a payment");
			user = new XId(email, "Email");
		}
		assert user != null;
		
		// collect the money
		String eventId = basket.getEventId();
		if (eventId==null) {
			eventId = basket.getItems().get(0).getEventId();
		}
		XId to = new XId(eventId+"@sogive-event", false); // HACK we want a better schema for saving money movements		
		MoneyCollector mc = new MoneyCollector(basket, user, email, to, state);
		mc.run();
						
		// store in the database (this will save the edited basket)
		super.doPublish(state, forceRefresh, deleteDraft);
		// store the tickets
		List<Ticket> items = basket.getItems();
		List<JThing<Ticket>> pubTickets = new ArrayList();
		for (Ticket ticket : items) {
			String id = ticket.getId();
			Utils.check4null(id); 
			ESPath draftPath = esRouter.getPath(dataspace, Ticket.class, id, KStatus.DRAFT);
			ESPath publishPath = esRouter.getPath(dataspace, Ticket.class, id, KStatus.PUBLISHED);
			JThing jticket = new JThing().setJava(ticket);
			JThing obj = AppUtils.doPublish(jticket, draftPath, publishPath);			
			pubTickets.add(obj);
			Log.d("basket", "published ticket "+id+" "+ticket);
		}
		
		// Process the order!
		Log.d("basket", "send process basket "+basket+" message...");
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
