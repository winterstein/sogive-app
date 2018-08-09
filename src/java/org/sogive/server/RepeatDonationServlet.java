package org.sogive.server;

import org.sogive.data.user.RepeatDonation;

import com.winterwell.web.app.CrudServlet;

public class RepeatDonationServlet extends CrudServlet<RepeatDonation> {

	public RepeatDonationServlet() {
		super(RepeatDonation.class);
	}

}
