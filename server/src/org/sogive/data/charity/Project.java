/**
 * 
 */
package org.sogive.data.charity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.function.BiPredicate;

import com.google.gson.JsonIOException;
import com.google.schemaorg.JsonLdFactory;
import com.google.schemaorg.JsonLdSerializer;
import com.google.schemaorg.JsonLdSyntaxException;
import com.google.schemaorg.core.BooleanEnum;
import com.google.schemaorg.core.CoreConstants;
import com.google.schemaorg.core.CoreFactory;
import com.google.schemaorg.core.DataFeed;
import com.google.schemaorg.core.NGO;
import com.google.schemaorg.core.NGO.Builder;
import com.winterwell.utils.containers.Containers;

/**
 * @author daniel
 *
 */
public class Project extends Thing<Project> {

	
	@Override
	public String toString() {	
		return "Project["+getName()+" "+get("year")+"]";
	}
	// Does schema org have a task defined by inputs / outputs??
	
	private static final long serialVersionUID = 1L;

	public Project(String name) {
		put("name", name);
	}
	Project() {	
	}

	public void merge(Project project) {
		// union inputs & outputs
		List<MonetaryAmount> inputs = getInputs();
		List<MonetaryAmount> newInputs = project.getInputs();
		for (MonetaryAmount n : newInputs) {
			if ( ! inputs.contains(n)) { // TODO match on name & year, to allow amounts to be corrected
				inputs.add(n);
			}
		}		
		List<Output> outputs = getOutputs();
		List<Output> newOutputs = project.getOutputs();
		for (Output n : newOutputs) {
			if ( ! outputs.contains(n)) { // TODO match on name & year, to allow amounts to be corrected
				outputs.add(n);
			}
		}
		// overwrite the rest
		putAll(project);
		project.put("inputs", inputs);
		project.put("outputs", outputs);
	}

	public List<MonetaryAmount> getInputs() {
		List outputs = getThings((List) get("inputs"), MonetaryAmount.class);
		if (outputs==null) {
			outputs = new ArrayList();
			put("inputs", outputs);
		}
		return outputs;
	}
	
	public List<Output> getOutputs() {
		List outputs = getThings((List) get("outputs"), Output.class);
		if (outputs==null) {
			outputs = new ArrayList();
			put("outputs", outputs);
		}
		return outputs;
	}

	public void addInput(String costName, MonetaryAmount ac) {
		ac.put("name", costName);
		addOrMerge("inputs", ac);
	}


	public void addOutput(Output ac) {
		List<Output> os = addOrMerge("outputs", ac, Output::match);
	}
	
	public Integer getYear() {
		return getInteger("year");
	}

}
