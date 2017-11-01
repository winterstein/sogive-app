package org.sogive.server;

import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.suggest.Suggesters;
import com.winterwell.gson.Gson;
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
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.app.WebRequest.KResponseType;
import com.winterwell.web.fields.BoolField;
import com.winterwell.web.fields.EnumField;
import com.winterwell.web.fields.IntField;
import com.winterwell.web.fields.SField;
import com.winterwell.youagain.client.AuthToken;
import com.winterwell.youagain.client.YouAgainClient;

import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.index.query.Operator;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.sort.SortBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.loader.ImportOSCRData; 
// Just imported to log progress of fixReady!
import com.winterwell.utils.log.Log;

public class SearchServlet implements IServlet {

	public SearchServlet() {
	}

	public static final SField Q = new SField("q");
	public static final IntField SIZE = new IntField("size");
	public static final IntField FROM = new IntField("from");
	public static final BoolField RECOMMENDED = new BoolField("recommended");
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
		SearchRequestBuilder s = client.prepareSearch(path.index()).setType(path.type);
		
		
		String q = state.get(Q);
		boolean showRecommended = state.get(RECOMMENDED, false);
		boolean fixReady = state.get(FIXREADY, false);
		
		if (fixReady) {
			s.setSize(MAX_RESULTS);
			SearchResponse sr = s.get();
			List<Map> hits = sr.getHits();
			Log.d("fixReady", "Found " + hits.size() + "charities to update");
			for (Map hit : hits) {
				Map charity = (Map) hit.get("_source");
				
				Object _id = charity.get("@id");
				Object _ready = charity.get("ready");
				Log.d("fixReady", "Charity " + _id + " has ready value " + _ready);
				
				boolean charityReady = Utils.yes(charity.get("ready"));
				if (charityReady) continue;
				
				Log.d("fixReady", "Ready value is not truthy, retrieving projects");
				List<Map> projects = (List<Map>) ((Map)charity).get("projects");
				if (projects == null) continue;
				
				Log.d("fixReady", "Charity has " + projects.size() + " projects, checking them");
				
				for (Map project : projects) {
					Object ready = project.get("ready");
					if (ready != null && Utils.yes(ready)) {
						charityReady = true;
						Log.d("fixReady", "Found ready project!");
						break;
					}
					Log.d("fixReady", "Project not ready");
				}
				
				if (charityReady) {
					Log.d("fixReady", "Now marking charity as ready!");
					charity.put("ready", true);
					JThing<NGO> item = new JThing();
					item.setMap(charity);
					AppUtils.doSaveEdit(config.getPath(NGO.class, (String) charity.get("@id"), KStatus.DRAFT), item, state);
					AppUtils.doPublish(item, config.getPath(NGO.class, (String) charity.get("@id"), KStatus.DRAFT),
							config.getPath(NGO.class, (String) charity.get("@id"), KStatus.PUBLISHED));
				} else {
					Log.d("fixReady", "Charity had no ready projects, not marking as ready.");
				}
			}
		}
		
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
		// prefix search for auto-complete
		String prefix = state.get("prefix");
		if (prefix != null) {
			s.addSuggester(Suggesters.autocomplete("suggest", prefix));
		}
		// else ?? ^DW 
		if (showRecommended) {
			QueryBuilder qb = QueryBuilders.termQuery("recommended", "true");
			s.setQuery(qb);
		}
		
		// TODO test ordering.
		// Show recommended charities before all other results
		SortBuilder recSort = SortBuilders.fieldSort("recommended").order(SortOrder.DESC).missing("_last").unmappedType("boolean");
		s.addSort(recSort);
		// Prioritise charities marked "ready for use"
		SortBuilder readySort = SortBuilders.fieldSort("ready").order(SortOrder.DESC).missing("_last").unmappedType("boolean");
		s.addSort(readySort);
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
		List<Map> hits = prefix==null? sr.getHits() : sr.getSuggesterHits("autocomplete");
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
