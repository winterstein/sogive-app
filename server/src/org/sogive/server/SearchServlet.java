package org.sogive.server;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.utils.Dependency;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.SField;

import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.sogive.data.charity.SoGiveConfig; 

public class SearchServlet {

	private final WebRequest state;

	public SearchServlet(WebRequest state) {
		this.state = state;
	}

	public static final SField Q = new SField("q");
	
	public void run() throws IOException {
		ESHttpClient client = new ESHttpClient();
		ESHttpClient.debug = true;
		SearchRequestBuilder s = client.prepareSearch(Dependency.get(SoGiveConfig.class).charityIndex);
		String q = state.get(Q);
		if ( q != null) {
			MultiMatchQueryBuilder qb = QueryBuilders.multiMatchQuery(q, "id", "englandWalesCharityRegNum", "name", "description");
			s.setQuery(qb);
		}
		// TODO paging!
		s.setSize(100);
		SearchResponse sr = s.get();
		Map<String, Object> jobj = sr.getParsedJson();
		List<Map> hits = sr.getHits();
		List<Map> hits2 = Containers.apply(h -> (Map)h.get("_source"), hits);
		int total = sr.getTotal();
		JsonResponse output = new JsonResponse(state, new ArrayMap(
				"hits", hits2,
				"total", total
				));
		WebUtils2.sendJson(output, state);
	}

}
