package org.sogive.data.charity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiPredicate;

import com.winterwell.utils.Utils;
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
	 * @return 
	 */
	public List<Project> addProject(Project project) {
		BiPredicate<Project,Project> matcher = (p1, p2) -> 
				Utils.equals(p1.getName(), p2.getName()) && Utils.equals(p1.get("year"), p2.get("year"));
		List<Project> projects = addOrMerge("projects", project, matcher);
		return projects;
	}
}
