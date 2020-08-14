//import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.winterwell.bob.BuildTask;
import com.winterwell.bob.tasks.MavenDependencyTask;
import com.winterwell.bob.tasks.WinterwellProjectFinder;
import com.winterwell.bob.wwjobs.BuildWinterwellProject;
import com.winterwell.bob.wwjobs.WWDependencyTask;

/**
 */
public class BuildSoGiveApp extends BuildWinterwellProject {

	public BuildSoGiveApp() throws Exception {
		super(new WinterwellProjectFinder().apply("sogive-app"), "sogive");
	}

	@Override
	public List<BuildTask> getDependencies() {
		List<BuildTask> deps = new ArrayList(super.getDependencies());
		
		MavenDependencyTask mdt = new MavenDependencyTask();
		mdt.addDependency("com.stripe:stripe-java:16.5.0");
		mdt.addDependency("org.projectlombok:lombok:1.18.12");
		mdt.addDependency("org.mockito:mockito-core:3.3.3");
		mdt.addDependency("com.opencsv:opencsv:5.2");
		deps.add(mdt);
		
		return deps;
	}

}
