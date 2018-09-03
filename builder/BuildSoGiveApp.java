

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.winterwell.bob.BuildTask;
import com.winterwell.bob.tasks.MavenDependencyTask;
import com.winterwell.bob.tasks.WinterwellProjectFinder;
import com.winterwell.calstat.BuildCalstat;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.web.app.build.KPubType;
import com.winterwell.web.app.build.PublishProjectTask;

import jobs.BuildWinterwellProject;


/**
 */
public class BuildSoGiveApp extends BuildWinterwellProject {
	
	public BuildSoGiveApp() throws Exception {
		super(new WinterwellProjectFinder().apply("sogive-app"), "sogive");
	}
	
	@Override
	public List<BuildTask> getDependencies() {
		List<BuildTask> deps = new ArrayList(super.getDependencies());
		deps.add(new BuildCalstat());
		deps.add(new MavenDependencyTask(stripe jar));
		return deps;
	}

}
