
//import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.winterwell.bob.BuildTask;
import com.winterwell.bob.tasks.MavenDependencyTask;
import com.winterwell.bob.tasks.WinterwellProjectFinder;
import com.winterwell.bob.wwjobs.BuildWinterwellProject;

/**
 */
public class BuildSoGiveApp extends BuildWinterwellProject {

	public BuildSoGiveApp() throws Exception {
		super(new WinterwellProjectFinder().apply("sogive-app"), "sogive");
		setScpToWW(false);
		setVersion("1.0.0"); // 22 Mar 2021
	}

	@Override
	public List<BuildTask> getDependencies() {
		List<BuildTask> deps = new ArrayList(super.getDependencies());

		MavenDependencyTask mdt = new MavenDependencyTask();
		mdt.addDependency("com.stripe:stripe-java:20.30.0");
		mdt.addDependency("org.mockito:mockito-core:3.3.3");
		mdt.addDependency("org.jsoup:jsoup:1.13.1");
		deps.add(mdt);

		return deps;
	}

}
