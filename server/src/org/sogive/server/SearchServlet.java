package org.sogive.server;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.utils.Dep;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.SField;

import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.index.query.Operator;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.sogive.data.charity.SoGiveConfig; 

public class SearchServlet {

	private final WebRequest state;

	public SearchServlet(WebRequest state) {
		this.state = state;
	}

	public static final SField Q = new SField("q");
	
	public void run() throws IOException {
		ESHttpClient client = Dep.get(ESHttpClient.class);
		ESHttpClient.debug = true;
		SearchRequestBuilder s = client.prepareSearch(Dep.get(SoGiveConfig.class).charityIndex);
		String q = state.get(Q);
		if ( q != null) {
			QueryBuilder qb = QueryBuilders.multiMatchQuery(q, 
					"id", "englandWalesCharityRegNum", "name", "description", "tags")
							.operator(Operator.AND);
			s.setQuery(qb);
		}
		s.addSort("name", SortOrder.ASC);
		// TODO paging!
		s.setSize(10000);
		SearchResponse sr = s.get();
		Map<String, Object> jobj = sr.getParsedJson();
		List<Map> hits = sr.getHits();
		List<Map> hits2 = Containers.apply(hits, h -> (Map)h.get("_source"));
		
//		Collections.sort(arg0);
		
		long total = sr.getTotal();
		JsonResponse output = new JsonResponse(state, new ArrayMap(
				"hits", hits2,
				"total", total
				));
		WebUtils2.sendJson(output, state);
	}

}
