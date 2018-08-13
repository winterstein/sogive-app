package org.sogive.server;

import org.sogive.data.user.RepeatDonation;

import com.winterwell.web.app.CrudServlet;

public class RepeatdonationServlet extends CrudServlet<RepeatDonation> {

	public RepeatdonationServlet() {
		super(RepeatDonation.class);
	}

}
