package org.sogive.data.charity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiPredicate;

import com.winterwell.utils.StrUtils;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.SimpleJson;

public class NGO extends Thing<NGO> {
	private static final long serialVersionUID = 1L;

	@Override
	public void init() {
		super.init();
		// validate the projects
		List<Project> projects = getProjects();
	}
	
	public NGO(String ourid) {
		put("@id", ourid);
	}

	public NGO() {
		
	}
	
	
	public void setTags(String tags) {
		put("tags", tags); // TODO split. Notes say & but not sure the data follows that				
	}

	/**
	 * Name & year should be unique or it will merge.
	 * @param project
	 * @return 
	 */
	public List<Project> addProject(Project project) {		
		BiPredicate<Project,Project> matcher = (p1, p2) -> 
				Utils.equals(p1.getName(), p2.getName()) && Utils.equals(p1.getYear(), p2.getYear());
		List<Project> projects = addOrMerge("projects", project, matcher);
		return projects;
	}

	public List<Project> getProjects() {
		// TODO this is not good :(
		List ps = list(get("projects"));
		ps = getThings(ps, Project.class);
		put("projects", ps);
		return ps;
	}
	
	public boolean isReady() {
		return Utils.truthy(get("ready"));
	}
	
	public Project getRepProject() {
		List<Project> projects = getProjects();
		if (Utils.isEmpty(projects)) {
			return null;
		}
		// Representative and ready for use?
		List<Project> projects2 = Containers.filter(projects, p -> p.isReady() && p.isRep());
		List<Project> overalls = Containers.filter(projects, p -> p.getName().equals("overall"));

		if ( ! Utils.isEmpty(projects2)) {
			List<Project> latest = getLatestYear(projects2);
			if (latest.size() != 1) {
				Log.e("getRepProject", "Bogus project info in "+this+": More than one latest rep project! "+projects2);
			}
			return latest.get(0);
		}
		if ( ! Utils.isEmpty(overalls)) {
			List<Project> latest = getLatestYear(overalls);
			assert latest.size() == 1 : latest;
			return latest.get(0);
		}
		// fallback
		List<Project> latest = getLatestYear(projects);
		return latest.get(0);
	}

	@Override
	public String toString() {
		return "NGO[" + getName() + ", id=" + getId() + "]";
	}

	public static String idFromName(String charityName) {
		String id = StrUtils.toCanonical(charityName).replaceAll("\\s+", "-");
		assert ! Utils.isBlank(id) : charityName;
		return id;
	}

	
}
