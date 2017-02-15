package org.sogive.server;

import java.io.IOException;
import java.util.Map;

import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.WebRequest;

public class SearchServlet {

	private final WebRequest state;

	public SearchServlet(WebRequest state) {
		this.state = state;
	}

	public void run() throws IOException {
		ESHttpClient client = new ESHttpClient();
		SearchRequestBuilder s = client.prepareSearch(SoGiveServer.config.charityIndex);
//		QueryBuilder qb = QueryBuilders.;
//		s.setQuery(qb);
		SearchResponse sr = s.get();
		Map<String, Object> jobj = sr.getParsedJson();
		JsonResponse output = new JsonResponse(state, jobj);
		WebUtils2.sendJson(output, state);
	}

}
