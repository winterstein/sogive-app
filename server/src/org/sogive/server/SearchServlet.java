package org.sogive.server;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.utils.Dep;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.EnumField;
import com.winterwell.web.fields.IntField;
import com.winterwell.web.fields.SField;

import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.index.query.Operator;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.sogive.data.charity.NGO;
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
		SoGiveConfig config = Dep.get(SoGiveConfig.class); 
		KStatus status = state.get(AppUtils.STATUS, KStatus.PUBLISHED);
		ESPath path = config.getPath(null, NGO.class, null, status);
		SearchRequestBuilder s = client.prepareSearch(path.index()).setType(path.type);
		String q = state.get(Q);
		if ( q != null) {
			// Do we want this to handle e.g. accents??
			// Can ES do it instead??
			// See https://www.elastic.co/guide/en/elasticsearch/reference/5.5/analysis-asciifolding-tokenfilter.html
			q = StrUtils.toCanonical(q);			
			// this will query _all
			QueryBuilder qb = QueryBuilders.simpleQueryStringQuery(q)
								.defaultOperator(Operator.AND);
			
			// NB: this required all terms in one field, which felt wrong
//			QueryBuilder qb = QueryBuilders.multiMatchQuery(q, 
//					"id", "englandWalesCharityRegNum", "name", "displayName", "description", "whoTags", "whyTags", "whereTags", "howTags")
//							.operator(Operator.AND);			
			s.setQuery(qb);
		}
		// Order by name
		s.addSort("name.raw", SortOrder.ASC);
//		s.addSort("@id", SortOrder.ASC);
		
		// Paging
		// TODO also support search after https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-search-after.html
		int pageSize = state.get(new IntField("numres").setMax(1000), 5);
		int from = state.get(new IntField("from"), 0);
		if (from==0) {
			int page = state.get(new IntField("page"), 0);
			if (page!=0) {
				from = page*pageSize;
			}
		}
		s.setSize(pageSize);
		s.setFrom(from);
		
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
