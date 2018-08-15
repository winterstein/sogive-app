

import java.util.List;

import com.winterwell.bob.BuildTask;
import com.winterwell.calstat.BuildCalstat;
import com.winterwell.web.app.build.KPubType;
import com.winterwell.web.app.build.PublishProjectTask;


/**
 */
public class PublishSoGiveApp extends PublishProjectTask {
	
	public PublishSoGiveApp() throws Exception {
		super("sogive", "/home/winterwell/sogive-app");
		//
		// OLD LEGACY SCRIPT
		//bashScript = "./publish-sogiveapp.sh";
		//
		// NEW SCRIPT
		bashScript = "../wwappbase.js/./project-publisher.sh sogive";
		// TODO: Get around this absolute path need.
		typeOfPublish = KPubType.test;
//		codePart = "backend";
//		compile = false;	
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
		
//		doTest(); tested by puppeteer
		
		doSendEmail("daniel.winterstein@gmail.com,sanjay@sogive.org,daniel.appel.winterwell@gmail.com,roscoe@winterwell.com");
	}	

}
