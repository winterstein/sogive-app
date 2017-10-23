package org.sogive.server;

import org.sogive.data.commercial.FundRaiserPage;

import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;

public class FundraiserServlet extends CrudServlet<FundRaiserPage> implements IServlet {

	public FundraiserServlet() {
		super(FundRaiserPage.class);
	}

}
