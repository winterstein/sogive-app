package org.sogive.server;

import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.maths.stats.distributions.discrete.ObjectDistribution;
import com.winterwell.utils.Dep;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.io.CSVSpec;
import com.winterwell.utils.io.CSVWriter;
import com.winterwell.utils.web.SimpleJson;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.app.WebRequest.KResponseType;
import com.winterwell.web.fields.EnumField;
import com.winterwell.web.fields.IntField;
import com.winterwell.web.fields.SField;

import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.index.query.Operator;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.sort.SortBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig; 

public class SearchServlet implements IServlet {

	public SearchServlet() {
	}

	public static final SField Q = new SField("q");
	public static final IntField SIZE = new IntField("size");
	public static final IntField FROM = new IntField("from");
	/**
	 * What will ES allow without scrolling??
	 */
	private static final int MAX_RESULTS = 10000;
	
	public void process(WebRequest state) throws Exception {
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
		// TODO test ordering.
		SortBuilder recSort = SortBuilders.fieldSort("recommend").order(SortOrder.DESC).missing("_last").unmappedType("boolean");
		s.addSort(recSort);
		s.addSort("name.raw", SortOrder.ASC);
//		s.addSort("@id", SortOrder.ASC);
		// TODO paging!
		
		int size = state.get(SIZE, 
				// HACK: csv => unlimited
				state.getResponseType() == KResponseType.csv? MAX_RESULTS : 20);
		s.setSize(size);
		s.setFrom(state.get(FROM, 0));
		SearchResponse sr = s.get();
		Map<String, Object> jobj = sr.getParsedJson();
		List<Map> hits = sr.getHits();
		List<Map> hits2 = Containers.apply(hits, h -> (Map)h.get("_source"));
		
//		Collections.sort(arg0);
		
		// HACK: send back csv?
		if (state.getResponseType() == KResponseType.csv) {
			doSendCsv(state, hits2);
			return;
		}
		
		
		long total = sr.getTotal();
		JsonResponse output = new JsonResponse(state, new ArrayMap(
				"hits", hits2,
				"total", total
				));
		WebUtils2.sendJson(output, state);
	}

	private void doSendCsv(WebRequest state, List<Map> hits2) {
		// ?? maybe refactor and move into a default method in IServlet?
		StringWriter sout = new StringWriter();
		CSVWriter w = new CSVWriter(sout, new CSVSpec());

		// what headers??
		// TODO proper recursive
		ObjectDistribution<String> headers = new ObjectDistribution();
		for (Map<String,Object> hit : hits2) {
			hit.keySet().forEach(key -> {
				Object v = hit.get(key);
				if (v instanceof Map) {
					Map subhit = (Map) v;
					subhit.keySet().forEach(subkey -> {
						Object sv = subhit.get(subkey);
						if (sv instanceof Map || sv instanceof List) return;
						headers.count(key+"."+subkey);	
					});
				} else if (v instanceof List) {
					List subhit = (List) v;
					for(int i=0; i<subhit.size(); i++) {
						Object sv = subhit.get(i);
						if (sv instanceof Map || sv instanceof List) return;
						headers.count(key+"."+i);	
					};
				} else {
					// a simple value
					headers.count(key);
				}
			});
		}
		// prune
		if (hits2.size() >= 1) {
			int min = Math.min(hits2.size(), 4);
			headers.pruneBelow(min);
		}
		// sort
		ArrayList<String> hs = new ArrayList(headers.keySet());
		hs.remove("name"); hs.remove("@id");
		Collections.sort(hs);
		hs.add(0, "@id");
		hs.add(0, "name");
		hs.remove("@type");
		// write
		w.write(hs);
		for (Map hit : hits2) {
			List<Object> line = Containers.apply(hs, h -> {
				String[] p = h.split("\\.");
				return SimpleJson.get(hit, p);
			});
			w.write(line);
		}
		w.close();
		// send
		String csv = sout.toString();
		state.getResponse().setContentType(WebUtils.MIME_TYPE_CSV); // + utf8??
		WebUtils2.sendText(csv, state.getResponse());
	}


}
