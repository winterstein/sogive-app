package org.sogive.server;

import javax.mail.internet.InternetAddress;

import org.sogive.data.commercial.Basket;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.commercial.Ticket;

import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.threads.Actor;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.Emailer;
import com.winterwell.web.email.SimpleMessage;

/**
 * When a basket is published and paid for. Fulfill the order offline. 
 * @author daniel
 *
 */
public class BasketPublishedActor extends Actor<Basket> {

	@Override
	protected void consume(Basket basket, Actor from) throws Exception {
		// make a fundraiser for each walker
		Log.d("BasketPublishedActor", "consume "+basket);
		basket.getItems().forEach(ticket -> process(ticket, basket));
	}

	private void process(Ticket ticket, Basket basket) {
		Log.d("BasketPublishedActor", "process ticket "+ticket+" from "+basket);
		// no email?!
		if (ticket.getAttendeeEmail()==null) {
			Log.e("TODO", "handle tickets without an email "+ticket+" from "+basket);
			return;
		}
		// make fundraiser
		FundRaiser fr = new FundRaiser(ticket, basket);
		JThing draft = new JThing<>(fr);
		ESPath draftPath = Dep.get(IESRouter.class).getPath(FundRaiser.class, fr.id, KStatus.DRAFT);
		ESPath publishPath = Dep.get(IESRouter.class).getPath(FundRaiser.class, fr.id, KStatus.PUBLISHED);
		AppUtils.doPublish(draft, draftPath, publishPath);
		
		// email user
		doEmailWalker(ticket, fr);
	}

	private void doEmailWalker(Ticket ticket, FundRaiser fr) {
		Emailer emailer = Dep.get(Emailer.class);
		if (emailer==null) {
			Log.e("BasketPublishedActor", "No Emailer?! Cannot email ticket info for "+ticket);
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

	}
	
}
