package org.sogive.server;

import org.sogive.data.commercial.Basket;

import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;

public class BasketServlet extends CrudServlet<Basket> {

	public BasketServlet() {
		super(Basket.class);
	}

}
