/**
 * 
 */
package org.sogive.data.charity;

import java.util.ArrayList;
import java.util.List;

import com.goodloop.data.Money;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.time.TimeUtils;

/**
 * @author daniel
 *
 */
public class Project extends Thing<Project> {

	private static final long serialVersionUID = 1L;;

	final String[] deductibleInputs = new String[] { "incomeFromBeneficiaries", "fundraisingCosts", "tradingCosts" };

	Project() {
	}

	public Project(String name) {
		put("name", name);
	}

	public void addInput(String costName, Money ac) {
		ac.setName(costName);
		addOrMerge("inputs", ac);
	}

	public void addOutput(Output ac) {
		List<Output> os = addOrMerge("outputs", ac, Output::match);
	}

	private void fixDate(String field) {
		Object v = get(field);
		String vraw = (String) get(field + "_raw");

		// TODO if vraw is null, set field to null
		// But that would break backwards compatibility

		if (vraw != null) {
			// convert to ISO format if not already
			try {
				Time time = TimeUtils.parseExperimental(vraw);
				String iso = time.toISOStringDateOnly();
				put(field, iso);
			} catch (Exception ex) {
				put(field, null); // avoid upsetting ES
			}
		}
	}

	/**
	 * Find the projectCosts or annualCosts input
	 * 
	 * @returns {Money}
	 */
	Money getCost() {
		List<Money> inputs = getInputs();
		List<Money> costs = Containers.filter(inputs,
				input -> "projectCosts".equals(input.getName()) || "annualCosts".equals(input.getName()));
		return costs.isEmpty() ? null : costs.get(0); // can be null
	}

	public List<Money> getInputs() {
		List outputs = getThings(list(get("inputs")), Money.class);
		if (outputs == null) {
			outputs = new ArrayList();
			put("inputs", outputs);
		}
		return outputs;
	}

	public List<Output> getOutputs() {
		List<Output> outputs = getThings(list(get("outputs")), Output.class);
		if (outputs == null) {
			outputs = new ArrayList();
			put("outputs", outputs);
		}
		// filter if no number & name
		List<Output> outputs2 = Containers.filter(outputs,
				output -> Utils.or(output.getName(), output.getNumber(), output.getAmount()) != null);
		if (outputs2.size() != outputs.size()) {
			put("outputs", outputs2);
		}
		return outputs2;
	}

	/**
	 * NB: code copy-pasta from Project.js
	 * 
	 * Actually, this is "get the total cost minus certain categories, so its more
	 * like total costs covered by donations"
	 * 
	 * @param {!Project} project
	 * @returns {!Money}
	 */
	Money getTotalCost() {
		// total - but some inputs are actually negatives
		List<Money> inputs = getInputs();
		Money total = new Money(null, 0);
		for (Money input : inputs) {
			if (input.isZero())
				continue;
			if (Containers.contains(input.getName(), deductibleInputs)) {
				// These count against the total
				// NB: Use abs in case an overly smart editor put them in as -ives
				total = total.minus(input);
			} else {
				// normal
				total = total.plus(input);
			}
		}
		return total;
	}

	final String[] deductibleInputs = new String[]{"incomeFromBeneficiaries", "tradingCosts"};
	@Override
	public void init() {
		super.init();
		// handle badly formatted dates
		fixDate("start");
		fixDate("end");
		// this will remove any blanks
		List<Money> inputs = getInputs();
		List<Output> outputs = getOutputs();
	}

	public boolean isOverall() {
		return getName() != null && getName().toLowerCase().equals("overall");
	}

	public boolean isRep() {
		Object ir = get("isRep");
		return Utils.truthy(ir);
	}

	public void merge(Project project) {
		// union inputs & outputs
		List<Money> inputs = getInputs();
		List<Money> newInputs = project.getInputs();
		for (Money n : newInputs) {
			if (!inputs.contains(n)) { // TODO match on name & year, to allow amounts to be corrected
				inputs.add(n);
			}
		}
		List<Output> outputs = getOutputs();
		List<Output> newOutputs = project.getOutputs();
		for (Output n : newOutputs) {
			if (!outputs.contains(n)) { // TODO match on name & year, to allow amounts to be corrected
				outputs.add(n);
			}
		}
		// overwrite the rest
		putAll(project);
		project.put("inputs", inputs);
		project.put("outputs", outputs);
	}

	@Override
	public String toString() {
		return "Project[" + getName() + " " + get("year") + "]";
	}
	// Does schema org have a task defined by inputs / outputs??

}
