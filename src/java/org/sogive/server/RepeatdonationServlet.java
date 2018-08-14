package org.sogive.server;

import java.io.IOException;

import org.sogive.data.user.RepeatDonation;

import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.WebRequest;

public class RepeatdonationServlet extends CrudServlet<RepeatDonation> {

	public RepeatdonationServlet() {
		super(RepeatDonation.class);
	}

	@Override
	protected void doList(WebRequest state) throws IOException {
		// TODO Auto-generated method stub
		super.doList(state);
	}
}
