/**
 * 
 */
package org.sogive.data.charity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

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
public class Project extends Thing {

	// Does schema org have a task defined by inputs / outputs??
	
	private static final long serialVersionUID = 1L;

	public Project(String name) {
		put("name", name);
	}

	public String getName() {
		return (String) get("name");
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

	List<MonetaryAmount> getInputs() {
		List outputs = (List) get("inputs");
		if (outputs==null) {
			outputs = new ArrayList();
			put("inputs", outputs);
		}
		return outputs;
	}
	
	List<Output> getOutputs() {
		List outputs = (List) get("outputs");
		if (outputs==null) {
			outputs = new ArrayList();
			put("outputs", outputs);
		}
		return outputs;
	}

	public void addInput(String costName, MonetaryAmount ac) {
		List<MonetaryAmount> inputs = getInputs();
		ac.put("name", costName);
		if (inputs.contains(ac)) return;
		// TODO name & year
//		int i = Containers.indexOf(inputs, in -> costName.equals(in.get("name")));
//		if (i==-1) {
			inputs.add(ac);
//			return;
//		}
//		inputs.set(i, ac);
	}


	public void addOutput(Output ac) {
		List<Output> inputs = getOutputs();
		if (inputs.contains(ac)) return;
		inputs.add(ac);
	}

}
