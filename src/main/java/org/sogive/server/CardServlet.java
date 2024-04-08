package org.sogive.server;

import org.sogive.data.commercial.Card;

import com.winterwell.web.app.CrudServlet;

/**
 * 
 */
public class CardServlet extends CrudServlet {

	public CardServlet() {
		super(Card.class);
	}

}
