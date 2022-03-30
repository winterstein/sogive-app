package org.sogive.data.charity;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.BiPredicate;

import com.goodloop.data.Money;
import com.goodloop.data.charity.Impact;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.log.Log;
import com.winterwell.web.data.XId;

public class NGO extends Thing<NGO> {

	private static final String LOGTAG = "NGO";
	private static final long serialVersionUID = 1L;

	public static String idFromName(String charityName) {
		String id = StrUtils.toCanonical(charityName).replaceAll("\\s+", "-");
		assert !Utils.isBlank(id) : charityName;
		return id;
	}

	public static XId xidFromId(String id) {
		assert !Utils.isBlank(id) : "NGO - Blank Id!";
		return new XId(id + "@sogive");
	}

	public NGO() {

	}

	public NGO(String ourid) {
		put("@id", ourid);
	}

	/**
	 * Name & year should be unique or it will merge.
	 * 
	 * @param project
	 * @return
	 */
	public List<Project> addProject(Project project) {
		BiPredicate<Project, Project> matcher = (p1, p2) -> Utils.equals(p1.getName(), p2.getName())
				&& Utils.equals(p1.getYear(), p2.getYear());
		List<Project> projects = addOrMerge("projects", project, matcher);
		return projects;
	}

	/**
	 * 
	 * @param project
	 * @return unit-output
	 * @throws Exception
	 */
	private Output calcSimpleImpact(Project project) throws Exception {
		List<Output> outputs = project.getOutputs();
		if (outputs.isEmpty()) {
			return new Output(1.0, "No Outputs! for project " + project);
		}
		if (outputs.size() > 1) {
			Log.d(LOGTAG, getId() + " simple impact based on only one output from " + outputs);
		}
		Output output = outputs.get(0);
		Money cost = costPerBeneficiary(project, output);

		Output unitOutput = new Output();
		unitOutput.setName(output.getName());
		unitOutput.put("number", 1.0);
		unitOutput.setCostPerBeneficiary(cost);
		return unitOutput;
	}

	/**
	 * NB: code copy-pasta from Project.js
	 * 
	 * @return {Money}
	 */
	Money costPerBeneficiary(Project project, Output output) {
		// Is an override present? Forget calculation and just return that.
		if (output != null && output.getCostPerBeneficiary() != null) {
			return output.getCostPerBeneficiary();
		}
		return costPerBeneficiaryCalc(project, output);
	}

	/**
	 * NB: code copy-pasta from Project.js
	 * 
	 * This ignores the override (if set)
	 */
	Money costPerBeneficiaryCalc(Project project, Output output) {
		Double outputCount = output.getNumber();
		if (outputCount == null)
			return null;
		Money projectCost = project.getTotalCost();
		if (projectCost == null) {
			Log.d("No project cost?! " + getId(), project);
			return null;
		}
		// overheads?
		if (!project.isOverall()) {
			// NB: catch bad no-year data
			int year = project.getYear() == null ? 2020 : project.getYear().intValue();
			double adjustment = getOverheadAdjustment(year);
			Money adjustedProjectCost = projectCost.multiply(adjustment);
			projectCost = adjustedProjectCost;
		}
		Money costPerOutput = new Money(projectCost).multiply(1.0 / outputCount);
		return costPerOutput;
	}

	public String getDisplayName() {
		return (String) get("displayName");
	}

	/**
	 * NB: code copy-pasta from Project.js
	 * 
	 * @param {NGO}           ngo
	 * @param {String|Number} yr
	 * @returns {Project} the overall project for year, or undefined
	 */
	Project getOverall(int yr) {
		Project overall = Containers.first(getProjects(), p -> p.isOverall() && p.getYear() == yr);
		return overall;
	}

	double getOverheadAdjustment(int year) {
		try {
			// get the overall for that year
			Project overall = getOverall(year);
			if (overall == null) {
				return 1;
			}
			// get all the projects for that year
			List<Project> thatYearsProjects = Containers.filter(getProjects(),
					p -> !p.isOverall() && p.getYear() == year);
			// sum project costs, subtracting income
			Money overallCosts = overall.getTotalCost();
			// ?? how to handle project level inputs c.f. emails "Overheads calculation"
			List<Money> thatYearsProjectCosts = Containers.apply(thatYearsProjects, Project::getCost);
			Money totalProjectCost = Money.total(thatYearsProjectCosts);
			double adjustment = overallCosts.getValue100p() * 1.0 / totalProjectCost.getValue100p();
			if (!Double.isFinite(adjustment)) {
				return 1;
			}
			return adjustment;
		} catch (Exception err) {
			Log.w(LOGTAG, Arrays.asList("costPerBen overheads adjustment failed ", err, this, year));
			return 1;
		}
	}

	public List<Project> getProjects() {
		// TODO this is not good :(
		List ps = list(get("projects"));
		ps = getThings(ps, Project.class);
		put("projects", ps);
		return ps;
	}

	/**
	 * Usually null. ID for a charity to redirect to
	 * 
	 * @return
	 */
	public String getRedirect() {
		return (String) get("redirect");
	}

	public Project getRepProject() {
		List<Project> projects = getProjects();
		if (Utils.isEmpty(projects)) {
			return null;
		}
		// Representative and ready for use?
		List<Project> projects2 = Containers.filter(projects, p -> p.isRep());
		List<Project> overalls = Containers.filter(projects, p -> "overall".equals(p.getName()));

		if ( ! Utils.isEmpty(projects2)) {
			List<Project> latest = getLatestYear(projects2);
			Project firstLatest = latest.get(0);
			if (latest.size() == 1) {
				return firstLatest;
			}
			// ignore overall project if more than one rep project			
			latest = Containers.filter(latest, 
				project -> ! "overall".equals(project.getName())
				);
			if (latest.size() == 1) {
				return latest.get(0);
			}
			if (latest.isEmpty()) {
				// All overall in the same year?!
				return firstLatest;		
			}
			Log.w("getRepProject",
					"Bogus project info in " + this + ": More than one latest rep project! " + latest);
			return latest.get(0);
		}
		// an overall year project
		if ( ! Utils.isEmpty(overalls)) {
			List<Project> latest = getLatestYear(overalls);
			assert latest.size() == 1 : latest;
			return latest.get(0);
		}
		// fallback
		List<Project> latest = getLatestYear(projects);
		return latest.get(0);
	}

	public Output getSimpleImpact() {
		try {
			// add simple impact data
			Project project = getRepProject();
			if (project == null) {
				Log.d(LOGTAG, "No impact cos no Rep Project for " + getId());
				return null;
			}
			// add cost of a single output as "simpleImpact"
			Output unitOutput = calcSimpleImpact(project);
			if (unitOutput == null) {
				Log.d(LOGTAG, "No impact for " + getId() + " Rep project is " + project);
			} else {
				setSimpleImpact(unitOutput);
			}
			return unitOutput;
		} catch (Throwable ex) {
			Log.e(LOGTAG, ex);
			return null;
		}
	}
	
	@Override
	public void init() {
		super.init();
		// validate the projects
		List<Project> projects = getProjects();
		// suggest for autocomplete
		List<String> names = Containers.filterNulls(Arrays.asList(getName(), getDisplayName(), getId()));
		put("suggest", names);
	};

	public boolean isReady() {
		return Utils.truthy(get("ready"));
	}

	/**
	 * This is caluclated from other data
	 * 
	 * @param unitOutput
	 */
	public void setSimpleImpact(Output unitOutput) {		
		put("simpleImpact", unitOutput);
		// for GL
		if (unitOutput==null) {
			Log.d(LOGTAG, "setSimpleImact null unitOutput "+getId());
			return;
		}
		Money cpb = unitOutput.getCostPerBeneficiary();
		if (cpb==null) {
			Log.d(LOGTAG, "setSimpleImact - unitOutput with null CostPerBen "+getId()+" "+unitOutput);
			return;
		}
		ArrayList impacts = new ArrayList();
		Impact ic = new Impact();
		ic.setName(unitOutput.getName());
		ic.setCharity(getId());
		double n = unitOutput.getNumber(); // probably 1
		ic.setN(n);		
		ic.setAmount(cpb.multiply(n));
		impacts.add(ic);		
		put("impacts", impacts);
	}

	public void setTags(String tags) {
		put("tags", tags); // TODO split. Notes say & but not sure the data follows that
	}

	@Override
	public String toString() {
		return "NGO[" + getName() + ", id=" + getId() + "]";
	}

}
