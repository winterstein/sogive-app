package org.sogive.server;

import org.sogive.data.commercial.Event;

import com.winterwell.data.JThing;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;

public class EventServlet extends CrudServlet<Event> implements IServlet {

	public EventServlet() {
		super(Event.class);
	}


}
