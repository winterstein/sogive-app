package org.sogive.data.charity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.winterwell.utils.web.SimpleJson;

public class NGO extends Thing {
	private static final long serialVersionUID = 1L;

	public NGO(String ourid) {
		put("@id", ourid);
	}

	public void setTags(String tags) {
		put("tags", tags); // TODO split. Notes say & but not sure the data follows that
	}

	/**
	 * Name should be unique or it will merge.
	 * @param project
	 */
	public void addProject(Project project) {
		List<Project> projects = (List) get("projects");
		if (projects==null) {
			projects = new ArrayList();
			put("projects", projects);
		}
		for (Project pold : projects) {
			if (project.getId().equals(pold.getId())) {
				pold.merge(project);
				return;
			}
		}
		projects.add(project);
	}
}
