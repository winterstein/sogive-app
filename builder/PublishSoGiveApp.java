

import java.io.File;
import java.util.List;

import com.winterwell.bob.BuildTask;
import com.winterwell.calstat.BuildCalstat;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.web.app.build.KPubType;
import com.winterwell.web.app.build.PublishProjectTask;


/**
 */
public class PublishSoGiveApp extends PublishProjectTask {
	
	public PublishSoGiveApp() throws Exception {
		super("sogive", "/home/winterwell/sogive-app");
		bashScript = "../wwappbase.js/./project-publisher.sh sogive";
//		bashScript = "../wwappbase.js/./test-script.sh sogive";
		typeOfPublish = KPubType.test;
	}
	
	@Override
	public List<BuildTask> getDependencies() {
		List<BuildTask> deps = super.getDependencies();
		deps.add(new BuildCalstat());
		return deps;
	}

	@Override
	protected void doTask() throws Exception {
		super.doTask();		
		
		doSendEmail("daniel.winterstein@gmail.com,sanjay@sogive.org,daniel.appel.winterwell@gmail.com,roscoe@winterwell.com");
	}


}
