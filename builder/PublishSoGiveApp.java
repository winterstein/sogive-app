


import java.util.Arrays;
import java.util.List;

import com.winterwell.bob.tasks.TestWebsiteTask;
import com.winterwell.web.app.KPubType;
import com.winterwell.web.app.PublishProjectTask;


/**
 */
public class PublishSoGiveApp extends PublishProjectTask {
	
	public PublishSoGiveApp() throws Exception {
		super("sogive", "/home/winterwell/sogive-app");
		bashScript = "./publish-sogiveapp.sh";
		typeOfPublish = KPubType.production;
//		codePart = "backend";
//		compile = false;	
	}

	@Override
	protected void doTask() throws Exception {
		super.doTask();		
		
//		doTest(); tested by puppeteer
		
		doSendEmail("daniel.winterstein@gmail.com,sanjay@sogive.org,daniel.appel.winterwell@gmail.com,roscoe@winterwell.com");
	}	

}
