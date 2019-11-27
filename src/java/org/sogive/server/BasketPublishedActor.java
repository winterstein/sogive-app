package org.sogive.server;

import javax.mail.internet.InternetAddress;

import org.sogive.data.commercial.Basket;
import org.sogive.data.commercial.Card;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.commercial.Ticket;

import com.winterwell.data.AThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.es.client.KRefresh;
import com.winterwell.gson.FlexiGson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.threads.Actor;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.Emailer;
import com.winterwell.web.email.SimpleMessage;

/**
 * When a basket is published and paid for. Fulfill the order offline. 
 * @author daniel
 *
 */
public class BasketPublishedActor extends Actor<Basket> {

	private static final String LOGTAG = "BasketPublishedActor";

	@Override
	protected void consume(Basket basket, Actor from) throws Exception {
		// make a fundraiser for each walker
		Log.d(LOGTAG, "consume "+basket+" tickets "+basket.getItems());
		basket.getItems().forEach(ticket -> process(ticket, basket));
	}

	private void process(Ticket ticket, Basket basket) {
		try {
			Log.d(LOGTAG, "process ticket "+ticket+" from "+basket);
			// no email?!
			if (ticket.getAttendeeEmail()==null) {
				Log.e("TODO", "handle tickets without an email "+ticket+" from "+basket);
				return;
			}
			
			// make card?
			AThing fr;
			if (Card.KIND_CARD.equalsIgnoreCase(ticket.getKind())) {
				fr = new Card(ticket, basket);
			} else {		
				// make fundraiser
				fr = new FundRaiser(ticket, basket);		
			}
			JThing draft = new JThing<>(fr);
			IESRouter iesRouter = Dep.get(IESRouter.class);
			ESPath draftPath = iesRouter.getPath(fr.getClass(), fr.id, KStatus.DRAFT);
			ESPath publishPath = iesRouter.getPath(fr.getClass(), fr.id, KStatus.PUBLISHED);
			// fast refresh, as there is a race vs the user
			AppUtils.doPublish(draft, draftPath, publishPath, KRefresh.TRUE, true);
	
			// TODO send e-card -- For now, just notify us
			if (Card.KIND_CARD.equalsIgnoreCase(ticket.getKind())) {
				notifyUs(ticket);
				return; // Don't email the "walker"
			} else {
				Log.d(LOGTAG, "dont sent notify Card email cos kind="+ticket.getKind()+" in "+ticket);
			}
			
			// email user
			try {
				doEmailWalker(ticket, fr);
			} catch(Throwable ex) {
				Log.e("BasketPublished", ex);
			}
		} catch(Throwable ex) { // paranoia
			Log.e(LOGTAG, ex);
			throw Utils.runtime(ex);
		}
	}

	
	/**
	 * Yay - tell us a card was bought
	 * @param ticket
	 */
	private void notifyUs(Ticket ticket) {
		try {
			Log.i(LOGTAG, "notifyUs "+ticket);
			Emailer emailer = Dep.get(Emailer.class);
			SimpleMessage email = new SimpleMessage(emailer.getBotEmail().toString(), 
					"support@sogive.org", "Shop "+AppUtils.getServerType()+" "+AppUtils.getFullHostname()+" - card bought :)", 
					"NOTE: We now have to send the physical card and the e-card!\n\n"+
					FlexiGson.toJSON(ticket));
			emailer.send(email);
			Log.i(LOGTAG, "...notifyUs sent "+ticket);
		} catch(Exception ex) {
			Log.e(LOGTAG, ex);
		}
	}

	private void doEmailWalker(Ticket ticket, AThing fr) {
		Log.i(LOGTAG, "doEmailWalker "+ticket+" "+fr);
		Emailer emailer = Dep.get(Emailer.class);
		if (emailer==null) {
			Log.e(LOGTAG, "No Emailer?! Cannot email ticket info for "+ticket);
			return;
		}
		String e = ticket.getAttendeeEmail();		
		if (Utils.isBlank(e)) {
			return;
		}
		
		// HACK for safe testing delete
		if ( ! e.contains("mcguffin") && ! e.contains("winterwell") && ! e.contains("sogive")
				&& ! e.contains("sodash")) {
			Log.e("BasketPublished", "Skip email to "+e);
			return;
		}
		
		InternetAddress to = WebUtils2.internetAddress(e);
		String subject = "Thank you for registering!";
		String body = "Welcome to the event "+ticket.getAttendeeName()
			+"\n\nYour fundraiser is: "
				+fr.id+" \n"+fr.getUrl();
		SimpleMessage email = new SimpleMessage(emailer.getBotEmail(), to, subject, body);
		emailer.send(email);
		
		// HACK update emailed flag
		if (fr instanceof Card) {
			IESRouter iesRouter = Dep.get(IESRouter.class);
			ESPath publishPath = iesRouter.getPath(fr.getClass(), fr.id, KStatus.PUBLISHED);
			((Card)fr).setEmailed(true);
			AppUtils.doSaveEdit2(publishPath, new JThing(fr), null);
		}
	}
	
}
