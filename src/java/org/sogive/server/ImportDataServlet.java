package org.sogive.server;

import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import org.sogive.data.loader.*;

import com.winterwell.web.WebEx;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.SField;

/**
 * a bit hacky but useful: import data into SoGive 
 * @author daniel
 *
 */
public class ImportDataServlet implements IServlet {

	private static ImportOSCRData oscr;
	private static ImportEditorialsDataTask importEditorialsTask;

	@Override
	public void process(WebRequest state) throws Exception {
		String dataset = state.getRequired(new SField("dataset"));
		// Scottish official data?
		if ("OSCR".equals(dataset)) {
			oscr = new ImportOSCRData();
			if (oscr.isRunning()) {
				throw new WebEx.E400("Repeat call");
			}
			oscr.run();
		}
		// A Google doc of editorials?
		if ("editorials".equals(dataset)) {
			String url = state.get("url");
			JsoupDocumentFetcher jsoupDocumentFetcher = new JsoupDocumentFetcherImpl();
			DatabaseWriter databaseWriter = new ElasticSearchDatabaseWriter();
			importEditorialsTask = new ImportEditorialsDataTask(jsoupDocumentFetcher, databaseWriter);
			if (importEditorialsTask.isRunning()) {
				throw new WebEx.E400("Repeat call");
			}
			int totalImported = importEditorialsTask.run(url);
			JsonResponse output = new JsonResponse(state, new ArrayMap(
					"totalImported", totalImported
			));
			WebUtils2.sendJson(output, state);
		}
	}

}
