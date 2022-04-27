package org.sogive.server;

import org.sogive.data.loader.DatabaseWriter;
import org.sogive.data.loader.ElasticSearchDatabaseWriter;
import org.sogive.data.loader.ImportEditorialsDataTask;
import org.sogive.data.loader.ImportOSCRData;
import org.sogive.data.loader.ImportEWCCData;
import org.sogive.data.loader.JsoupDocumentFetcher;
import org.sogive.data.loader.JsoupDocumentFetcherImpl;

import com.winterwell.depot.Desc;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.SField;

/**
 * a bit hacky but useful: import data into SoGive
 * 
 * @author daniel
 *
 */
public class ImportDataServlet implements IServlet {

	private static ImportEditorialsDataTask importEditorialsTask;
	private static ImportOSCRData oscr;
	private static ImportEWCCData ewcc;

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
		// England & Wales official data
		if ("EWCC".equals(dataset)) {
			DatabaseWriter databaseWriter = new ElasticSearchDatabaseWriter(); 
			String depotServer = Desc.CENTRAL_SERVER;
			int ngoExceptionLimit = 30;
			ewcc = new ImportEWCCData(databaseWriter, depotServer, ngoExceptionLimit);
			if (ewcc.isRunning()) {
				throw new WebEx.E400("Repeat call");
			}
			String resp = "EWCC now processing. Check logs for stats &/or errors.";
			JsonResponse output = new JsonResponse(state, resp);
			WebUtils2.sendJson(output, state);
			ewcc.run();
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
			ArrayMap result = importEditorialsTask.run(url);
			JsonResponse output = new JsonResponse(state, result);
			WebUtils2.sendJson(output, state);
		}
	}

}
