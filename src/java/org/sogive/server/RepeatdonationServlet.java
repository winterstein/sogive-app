package org.sogive.server;

import java.io.IOException;
import java.util.List;

import org.sogive.data.user.RepeatDonation;

import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.WebRequest;

public class RepeatdonationServlet extends CrudServlet<RepeatDonation> {

	public RepeatdonationServlet() {
		super(RepeatDonation.class);
	}
}
