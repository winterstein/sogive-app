package org.sogive.server;

import org.sogive.data.user.Team;

import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.IServlet;

public class TeamServlet extends CrudServlet<Team> implements IServlet {

	public TeamServlet() {
		super(Team.class);
	}

}
