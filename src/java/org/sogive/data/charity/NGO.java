package org.sogive.data.charity;

import java.util.Arrays;
import java.util.List;
import java.util.function.BiPredicate;

import com.goodloop.data.Money;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.log.Log;
import com.winterwell.web.data.XId;

public class NGO extends Thing<NGO> {
		
	private static final long serialVersionUID = 1L;
	private static final String LOGTAG = "NGO";

	@Override
	public void init() {
		super.init();
		// validate the projects
		List<Project> projects = getProjects();
		// suggest for autocomplete
		List<String> names = Containers.filterNulls(Arrays.asList(
				getName(), getDisplayName(), getId()
				));
		put("suggest", names);
	}
	
	public String getDisplayName() {
		return (String) get("displayName");
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
		List<Project> projects2 = Containers.filter(projects, p -> p.isRep());
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

	public static XId xidFromId(String id) {
		assert ! Utils.isBlank(id) : "NGO - Blank Id!";
		return new XId(id+"@sogive");
	}

	/**
	 * This is caluclated from other data 
	 * @param unitOutput
	 */
	public void setSimpleImpact(Output unitOutput) {
		put("simpleImpact", unitOutput);
	}

	public Output getSimpleImpact() {
		try {
			// add simple impact data
			Project project = getRepProject();
			if (project==null) {
				return new Output(1.0, "No Rep Project!");
//				return null;
			}
			// add cost of a single output as "simpleImpact"
			Output unitOutput = calcSimpleImpact(project);
			if (unitOutput==null) unitOutput = new Output(1.0, "No impact! Rep project is "+project);
			put("simpleImpact", unitOutput);
			return unitOutput;
		} catch(Throwable ex) {
			Log.e(LOGTAG, ex);
			return null;
		}
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
			return new Output(1.0,"No Outputs! for project "+project);
		}
		if (outputs.size() > 1) {
			Log.d(LOGTAG, getId()+" simple impact based on only one output from "+outputs);
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
		if (output!=null && output.getCostPerBeneficiary() != null) {
			return output.getCostPerBeneficiary();
		}
		return costPerBeneficiaryCalc(project, output);
	};

	/**
	 * NB: code copy-pasta from Project.js
	 * 
	 * @param {NGO} ngo 
	 * @param {String|Number} yr 
	 * @returns {Project} the overall project for year, or undefined
	 */
	Project getOverall(int yr) {
		Project overall = Containers.first(getProjects(),
				p -> p.isOverall() && p.getYear() == yr);
		return overall;
	}

	/**
	 * NB: code copy-pasta from Project.js
	 * 
	 * This ignores the override (if set)
	 */
	Money costPerBeneficiaryCalc(Project project, Output output) {	
		Double outputCount = output.getNumber();
		if (outputCount==null) return null;
		Money projectCost = project.getTotalCost();
		if (projectCost==null) {
			Log.d("No project cost?! "+getId(), project);
			return null;
		}
		// overheads?
		if ( ! project.isOverall()) {
			int year = project.getYear().intValue();
			double adjustment = getOverheadAdjustment(year);
			Money adjustedProjectCost = projectCost.multiply(adjustment);
//			let v = Money.value(adjustedProjectCost);
			projectCost = adjustedProjectCost;		
		}
//		if ( ! $.isNumeric(outputCount)) {
//			console.error("NGO.js - Not a number?! "+outputCount, "from", output);
//			return 1/0; // NaN
//		}
//		assMatch(outputCount, Number, "NGO.js outputCount not a Number?! "+outputCount);
		Money costPerOutput = new Money(projectCost).multiply(1.0/outputCount);
//		Money.setValue(costPerOutput, projectCost.value / outputCount);
		return costPerOutput;
	}

	double getOverheadAdjustment(int year) {
		try {
			// get the overall for that year
			Project overall = getOverall(year);
			if (overall==null) {
				return 1;
			}
			// get all the projects for that year
			List<Project> thatYearsProjects = Containers.filter(getProjects(),
					p -> ! p.isOverall() && p.getYear() == year);
			// sum project costs, subtracting income
			Money overallCosts = overall.getTotalCost();
			// ?? how to handle project level inputs c.f. emails "Overheads calculation"
			List<Money> thatYearsProjectCosts = Containers.apply(thatYearsProjects, Project::getCost);
			Money totalProjectCost = Money.total(thatYearsProjectCosts);
			double adjustment = overallCosts.getValue100p()*1.0 / totalProjectCost.getValue100p();
			if ( ! Double.isFinite(adjustment)) {
				return 1;
			}
			return adjustment;
		} catch(Exception err) {
			Log.w(LOGTAG, Arrays.asList("costPerBen overheads adjustment failed ", err, this, year));		
			return 1;
		}
	};

	
}
