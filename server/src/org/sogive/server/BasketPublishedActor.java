package org.sogive.server;

import org.sogive.data.commercial.Basket;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.commercial.Ticket;

import com.winterwell.utils.threads.Actor;

/**
 * When a basket is published and paid for. Fulfill the order offline. 
 * @author daniel
 *
 */
public class BasketPublishedActor extends Actor<Basket> {

	@Override
	protected void consume(Basket basket, Actor from) throws Exception {
		// make a fundraiser for each walker
		basket.getItems().forEach(ticket -> process(ticket, basket));
	}

	private void process(Ticket ticket, Basket basket) {
		// make fundraiser
		FundRaiser fr = new FundRaiser(ticket, basket);
	}
	
}
