


import java.util.Arrays;
import java.util.List;

import com.winterwell.bob.tasks.TestWebsiteTask;
import com.winterwell.web.app.KPubType;
import com.winterwell.web.app.PublishProjectTask;


/**
 */
public class PublishSoGiveApp extends PublishProjectTask {
			
	private String urlBase;
	private List<String> testUrls;

	public PublishSoGiveApp() throws Exception {
		super("sogive", "/home/winterwell/sogive-app");
		bashScript = "./publish-sogiveapp.sh";
		typeOfPublish = KPubType.test;
//		codePart = "backend";
		compile = false;
		
		urlBase = typeOfPublish == KPubType.production? "https://app.sogive.org/" : "https://test.sogive.org/";
		testUrls = Arrays.asList("#search", "#charity?charityId=against-malaria-foundation");
	}

	@Override
	protected void doTask() throws Exception {
		super.doTask();		
		
		doTest();
		
		doSendEmail("daniel.winterstein@gmail.com,sanjay@sogive.org,daniel.appel.winterwell@gmail.com,roscoe@winterwell.com");
	}

	private void doTest() {
		TestWebsiteTask twt = new TestWebsiteTask();
		twt.setBaseUrl(urlBase);
		twt.setTestUrls(Arrays.asList("#search", "#charity?charityId=against-malaria-foundation"));
		twt.run();
	}
	

}
