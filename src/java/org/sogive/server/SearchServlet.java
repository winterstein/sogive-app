package org.sogive.server;

import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig;

import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.query.BoolQueryBuilder;
import com.winterwell.es.client.query.BoostingQueryBuilder;
import com.winterwell.es.client.query.ESQueryBuilder;
import com.winterwell.es.client.query.ESQueryBuilders;
import com.winterwell.es.client.sort.KSortOrder;
import com.winterwell.es.client.sort.Sort;
import com.winterwell.es.client.suggest.Suggesters;
import com.winterwell.maths.stats.distributions.discrete.ObjectDistribution;
import com.winterwell.utils.Dep;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.io.CSVSpec;
import com.winterwell.utils.io.CSVWriter;
import com.winterwell.utils.web.SimpleJson;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.app.WebRequest.KResponseType;
import com.winterwell.web.fields.BoolField;
import com.winterwell.web.fields.EnumField;
import com.winterwell.web.fields.IntField;
import com.winterwell.web.fields.SField;

public class SearchServlet implements IServlet {

	public SearchServlet() {
	}

	public static final SField Q = new SField("q");
	public static final IntField SIZE = new IntField("size");
	public static final IntField FROM = new IntField("from");
	
	/**
	 * e.g. "high" (aka gold)
	 */
	public static final SField IMPACT = new SField("impact");
	
	public static final BoolField FIXREADY = new BoolField("fixready");
	/**
	 * What will ES allow without scrolling??
	 */
	private static final int MAX_RESULTS = 10000;
	
	public void process(WebRequest state) throws Exception {
		WebUtils2.CORS(state, false);
		ESHttpClient client = Dep.get(ESHttpClient.class);
		ESHttpClient.debug = true;
		SoGiveConfig config = Dep.get(SoGiveConfig.class); 
		KStatus status = state.get(AppUtils.STATUS, KStatus.PUBLISHED);
		ESPath path = config.getPath(null, NGO.class, null, status);
		SearchRequestBuilder s = new SearchRequestBuilder(client).setPath(path);
		s.setDebug(true);		
		String q = state.get(Q);
		
		String impact = state.get(IMPACT);
		
		if ( q != null) {			
			// Do we want this to handle e.g. accents??
			// Can ES do it instead??
			// See https://www.elastic.co/guide/en/elasticsearch/reference/5.5/analysis-asciifolding-tokenfilter.html
			q = StrUtils.toCanonical(q);
			// this will query _all			
			ESQueryBuilder qbq = ESQueryBuilders.simpleQueryStringQuery(q);
			s.addQuery(qbq);
			
//			SearchQuery sq = new SearchQuery(q);
			// TODO AppUtils.makeESFilterFromSearchQuery(sq, start, end)
			// NB: this required all terms in one field, which felt wrong
//			QueryBuilder qb = QueryBuilders.multiMatchQuery(q, 
//					"id", "englandWalesCharityRegNum", "name", "displayName", "description", "whoTags", "whyTags", "whereTags", "howTags")
//							.operator(Operator.AND);			
			
		}
		// prefix search for auto-complete
		String prefix = state.get("prefix");
		if (prefix != null) {
			s.addSuggester(Suggesters.autocomplete("suggest", prefix));
		}
		
		// Data status Filters
		if (impact != null) {
			ESQueryBuilder qb = ESQueryBuilders.termQuery("impact", impact);
			s.addQuery(qb);
		} else {
			// prefer high impact, but dont force it			
//			ESQueryBuilder qb = ESQueryBuilders.termQuery("impact", "high");
//			ESQueryBuilder preferHigh = new BoostingQueryBuilder().positive(qb);
//			s.addQuery(preferHigh);
			// Ought to work, but seems to act as a hard filter?! Apr 2020
			// use a post-search sort instead
		}
		boolean onlyHasImpact = state.get(new BoolField("hasImpact"), false);
		if (onlyHasImpact) {
			ESQueryBuilder qb = ESQueryBuilders.existsQuery("projects");
			s.addQuery(qb);
		}
		Boolean onlyReady = state.get(new BoolField("ready"));
		if (Utils.yes(onlyReady)) {
			ESQueryBuilder qb = ESQueryBuilders.termQuery("ready", "true");
			s.addQuery(qb);
		}
		
		// TODO test ordering.
		// TODO sort by impact - show high-impact charities before all other results
//		Sort recSort = new Sort("recommended", KSortOrder.desc);
				//.setMissing("_last").unmappedType("boolean");
//		s.addSort(recSort);
		// Prioritise charities marked "ready for use"
		Sort readySort = new Sort("ready", KSortOrder.desc);
				//.setMissing("_last").unmappedType("boolean");
		s.addSort(readySort);
		// After that - just use the relevance score
		s.addSort(Sort.scoreSort());
		// s.addSort("name.raw", SortOrder.ASC);
		// s.addSort("@id", SortOrder.ASC);
		s.setDebug(true);
		
		int size = state.get(SIZE, 
				// HACK: csv => unlimited
				state.getResponseType() == KResponseType.csv? MAX_RESULTS : 20);
		s.setSize(size);
		s.setFrom(state.get(FROM, 0));
		SearchResponse sr = s.get();
		Map<String, Object> jobj = sr.getParsedJson();
		List<Map> hits = prefix==null? sr.getHits() : sr.getSuggesterHits("autocomplete");
		List<Map> hits2 = Containers.apply(hits, h -> (Map)h.get("_source"));
		
		// Move high impact to be first
		List<Map> highImpact = Containers.filter(hits2, hit -> "high".equals(hit.get("impact")));
		hits2.removeAll(highImpact);
		hits2.addAll(0, highImpact);
		
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
			getHeaders(hit, new ArrayList(), headers);
		}
		// prune
		if (hits2.size() >= 1) {
			int min = (int) (hits2.size() * 0.2);
			if (min>0) headers.pruneBelow(min);
		}
		// sort
		ArrayList<String> hs = new ArrayList(headers.keySet());
		// all the level 1 headers
		List<String> level1 = Containers.filter(hs, h -> ! h.contains("."));
		hs.removeAll(level1);
		Collections.sort(hs);
		Collections.sort(level1);		
		// start with ID, name
		level1.remove("name");
		level1.remove("@id");
		Collections.reverse(level1);
		level1.add("name");
		level1.add("@id");		
		level1.forEach(h -> hs.add(0, h));
		hs.removeIf(h -> h.contains("@type") || h.contains("value100"));
		
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

	private void getHeaders(Object hit, ArrayList path, ObjectDistribution<String> headers) {
		if (hit instanceof Map) {
			Map<String,Object> hmap = (Map<String, Object>) hit;
			hmap.keySet().forEach(key -> {
				Object v = hmap.get(key);
				ArrayList path2 = new ArrayList(path);
				path2.add(key);
				getHeaders(v, path2, headers);
			});
			return;
		}
		if (hit instanceof List) {
			List subhit = (List) hit;
			for(int i=0; i<subhit.size(); i++) {
				Object sv = subhit.get(i);
				ArrayList path2 = new ArrayList(path);
				path2.add(i);
				getHeaders(sv, path2, headers);
			};
			return;
		}
		// as is
		if (path.isEmpty()) return;
		headers.count(StrUtils.join(path, "."));
	}


}
