

//import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.winterwell.bob.BuildTask;
import com.winterwell.bob.tasks.MavenDependencyTask;
import com.winterwell.bob.tasks.WinterwellProjectFinder;

import jobs.BuildWinterwellProject;
import jobs.WWDependencyTask;


/**
 */
public class BuildSoGiveApp extends BuildWinterwellProject {
	
	public BuildSoGiveApp() throws Exception {
		super(new WinterwellProjectFinder().apply("sogive-app"), "sogive");
	}
	
	@Override
	public List<BuildTask> getDependencies() {
		List<BuildTask> deps = new ArrayList(super.getDependencies());
		deps.add(new MavenDependencyTask("com.stripe:stripe-java:6.9.0"));
		deps.add(new WWDependencyTask("calstat", "com.winterwell.calstat.BuildCalstat"));		
		return deps;
	}

}
