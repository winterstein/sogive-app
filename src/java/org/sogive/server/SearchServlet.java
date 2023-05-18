package org.sogive.server;

import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.sogive.data.charity.NGO;
import org.sogive.data.charity.Output;
import org.sogive.data.charity.SoGiveConfig;

import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.SearchRequest;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.query.BoolQueryBuilder;
import com.winterwell.es.client.query.ESQueryBuilder;
import com.winterwell.es.client.query.ESQueryBuilders;
import com.winterwell.es.client.sort.KSortOrder;
import com.winterwell.es.client.sort.Sort;
import com.winterwell.es.client.suggest.Suggesters;
import com.winterwell.nlp.query.SearchQuery;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.io.CSVSpec;
import com.winterwell.utils.io.CSVWriter;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.SimpleJson;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.app.WebRequest.KResponseType;
import com.winterwell.web.fields.BoolField;
import com.winterwell.web.fields.IntField;
import com.winterwell.web.fields.ListField;
import com.winterwell.web.fields.SField;

/**
 * Should this be replaced with {@link CharityServlet} _list??
 * 
 * @author daniel
 *
 */
public class SearchServlet implements IServlet {

	public static final BoolField FIXREADY = new BoolField("fixready");

	public static final IntField FROM = new IntField("from");
	private static final ListField<String> HEADERS = new ListField("headers");
	/**
	 * e.g. "high" (aka gold)
	 */
	public static final SField IMPACT = new SField("impact");

	/**
	 * What will ES allow without scrolling??
	 */
	private static final int MAX_RESULTS = 10000;

	public static final SField Q = new SField("q");
	public static final IntField SIZE = new IntField("size");
	private static String prettyCSVHeader(String h) {
		return h.replace("costPerBeneficiary", "costPerOutput");
	}

	public SearchServlet() {
	}

	private void doSendCsv(WebRequest state, List<Map> hits2) {
		// ?? maybe refactor and move into a default method in IServlet?
		// ?? stream out to the web response?
		StringWriter sout = new StringWriter();
		CSVWriter w = new CSVWriter(sout, new CSVSpec());

		final List<String> STD_HEADERS = Arrays
				.asList(("@id, project.name, project.year, name, displayName, summaryDescription, description, "
						+ "project.outputs.0.number, project.outputs.0.name, project.outputs.0.costPerBeneficiary, project.outputs.0.description, "
						+ "project.outputs.1.number, project.outputs.1.name, project.outputs.1.costPerBeneficiary, project.outputs.1.description, "
						// NB (there may sometimes be more than 2 outputs, but they won't be in the csv,
						// for those you'll have to go to the SoGive app to see those)
						+ "project.costs.annualCosts, project.costs.tradingCosts, project.costs.incomeFromBeneficiaries, "
						+ "reserves, " + "englandWalesCharityRegNum, scotlandCharityRegNum, ukCompanyRegNum, "
						+ "whyTags, howTags, whereTags, " + "url, " + "impact, confidence, recommendation, "
						+ "simpleImpact.name, simpleImpact.costPerBeneficiary.value, " + "isReady").split(",\\s*"));

		List<String> headers = state.get(HEADERS, STD_HEADERS);

		// write
		w.write(Containers.apply(headers, SearchServlet::prettyCSVHeader));
		for (Map hit : hits2) {
			doSendCsv2(w, headers, hit);
		}
		w.close();
		// send
		String csv = sout.toString();
		state.getResponse().setContentType(WebUtils.MIME_TYPE_CSV); // + utf8??
		WebUtils2.sendText(csv, state.getResponse());
	}

	private void doSendCsv2(CSVWriter w, List<String> headers, Map _hit) {
		// NB: This code does json -> java -> json, to invoke the simpleImpact compute.
		// This isn't the most efficient - we might want to test for whether
		// simpleImpact is present first
		// HACK simpleImpact
		try {
			JThing<NGO> jThing = new JThing().setType(NGO.class).setMap(_hit);
			NGO ngo = jThing.java();
			Output output = ngo.getSimpleImpact();
			jThing.setJava(ngo);
			_hit = new HashMap(jThing.map());
		} catch (Throwable ex) { // paranoia
			Log.e(ex);
		}
		final Map<String, Object> fhit = _hit;
		// split by project
		List<Map> projects = Containers.asList(fhit.get("projects"));
		if (Utils.isEmpty(projects)) {
			projects = new ArrayList();
			projects.add(new ArrayMap()); // so we send something
		}
		// one line per project
		for (Map project : projects) {
			fhit.put("project", project);
			List<Object> line = Containers.apply(headers, h -> {
				try { // paranoia
						// HACK for project costs
					if (h.startsWith("project.costs")) {
						String costName = h.substring("project.costs.".length());
						List<Map> inputs = Containers.asList(project.get("inputs"));
						if (inputs == null)
							return null;
						Map cost = Containers.first(inputs, input -> costName.equals(input.get("name")));
						if (cost == null) {
							return null;
						}
						return cost.get("value");
					}
//					if (h.contains("costPer")) { // debug
//						System.out.println(h);
//					}
					String[] p = h.split("\\.");
					Object v = SimpleJson.get(fhit, p);
					// HACK year - no trailing .0
					if ("project.year".equals(h) && v instanceof Number) {
						v = ((Number) v).intValue();
					}
					return v;
				} catch (Exception ex) {
					Log.e(ex);
					return null;
				}
			});
			w.write(line);
		}
	}

	public void process(WebRequest state) throws Exception {
		WebUtils2.CORS(state, false);
		ESHttpClient client = Dep.get(ESHttpClient.class);
		ESHttpClient.debug = true;
		SoGiveConfig config = Dep.get(SoGiveConfig.class);
		KStatus status = state.get(AppUtils.STATUS, KStatus.PUBLISHED);
		ESPath path = config.getPath(null, NGO.class, null, status);
		SearchRequest searchRequest = new SearchRequest(client).setPath(path);
		searchRequest.setDebug(true);
		String q = state.get(Q);

		String impact = state.get(IMPACT);

		if (q != null) {
			// Do we want this to handle e.g. accents??
			// Can ES do it instead??
			// See
			// https://www.elastic.co/guide/en/elasticsearch/reference/5.5/analysis-asciifolding-tokenfilter.html
//			q = StrUtils.toCanonical(q);
			// this will query _all
//			ESQueryBuilder qbq = ESQueryBuilders.simpleQueryStringQuery(q);
//			searchRequest.addQuery(qbq);

			SearchQuery sq = new SearchQuery(q);
			BoolQueryBuilder esq = AppUtils.makeESFilterFromSearchQuery(sq, null, null);
			searchRequest.addQuery(esq);
			
			// NB: this required all terms in one field, which felt wrong
//			QueryBuilder qb = QueryBuilders.multiMatchQuery(q, 
//					"id", "englandWalesCharityRegNum", "name", "displayName", "description", "whoTags", "whyTags", "whereTags", "howTags")
//							.operator(Operator.AND);					

		}
		// prefix search for auto-complete
		String prefix = state.get("prefix");
		if (prefix != null) {
			searchRequest.addSuggester(Suggesters.autocomplete("suggest", prefix));
		}

		// Data status Filters
		if (impact != null) {
			ESQueryBuilder qb = ESQueryBuilders.termQuery("impact", impact);
			searchRequest.addQuery(qb);
		} else {
			// prefer high impact, but don't force it
			// scaling the boost value to prevent charity with lower ranking show on top
			BoolQueryBuilder preferHigh = new BoolQueryBuilder();
			preferHigh.should(ESQueryBuilders.termQuery("impact", "high", 50.0));
			preferHigh.should(ESQueryBuilders.termQuery("impact", "medium", 30.0));
			preferHigh.should(ESQueryBuilders.termQuery("impact", "slightly-low", 10.0));
			preferHigh.should(ESQueryBuilders.termQuery("impact", "low", 5.0));
			preferHigh.should(ESQueryBuilders.termQuery("impact", "more-info-needed-promising", 4.0));
			preferHigh.should(ESQueryBuilders.termQuery("impact", "more-info-needed", 3.0));
			preferHigh.should(ESQueryBuilders.termQuery("impact", "too-rich", 2.0));
			preferHigh.should(ESQueryBuilders.termQuery("impact", "very-low", 1.0));
			preferHigh.must(ESQueryBuilders.match_all());
			searchRequest.addQuery(preferHigh);
		}
		boolean onlyHasImpact = state.get(new BoolField("hasImpact"), false);
		if (onlyHasImpact) {
			ESQueryBuilder qb = ESQueryBuilders.existsQuery("projects");
			searchRequest.addQuery(qb);
		}
		Boolean onlyReady = state.get(new BoolField("ready"));
		if (Utils.yes(onlyReady)) {
			ESQueryBuilder qb = ESQueryBuilders.termQuery("ready", "true");
			searchRequest.addQuery(qb);
		}

		// TODO test ordering.
//		Sort recSort = new Sort("recommended", KSortOrder.desc);
		// .setMissing("_last").unmappedType("boolean");
//		searchRequest.addSort(recSort);
		// Prioritise charities marked "ready for use"
		Sort readySort = new Sort("ready", KSortOrder.desc);
		// .setMissing("_last").unmappedType("boolean");
		searchRequest.addSort(readySort);
		// After that - just use the relevance score
		searchRequest.addSort(Sort.scoreSort());
		// searchRequest.addSort("name.raw", SortOrder.ASC);
		// searchRequest.addSort("@id", SortOrder.ASC);
		searchRequest.setDebug(true);

		// TODO paging - this uses a cap at 1k results
		int size = state.get(SIZE,
				// HACK: csv => unlimited
				state.getResponseType() == KResponseType.csv ? MAX_RESULTS : 100);
		searchRequest.setSize(size);
		searchRequest.setFrom(state.get(FROM, 0));
		SearchResponse searchResponse = searchRequest.get();
		Map<String, Object> jobj = searchResponse.getParsedJson();
		List<Map> hits = prefix == null ? searchResponse.getHits() : searchResponse.getSuggesterHits("autocomplete");
		List<Map> hits2 = Containers.apply(hits, h -> (Map) h.get("_source"));
		
		// HACK: send back csv?
		if (state.getResponseType() == KResponseType.csv) {
			doSendCsv(state, hits2);
			return;
		}

		Long total = searchResponse.getTotal();
		JsonResponse output = new JsonResponse(state, 
				new ArrayMap("hits", hits2, "total", total));
		WebUtils2.sendJson(output, state);
	}

	// deprecated - work out which headers from the data
//	private void getHeaders(Object hit, ArrayList path, ObjectDistribution<String> headers) {
//		if (hit instanceof Map) {
//			Map<String,Object> hmap = (Map<String, Object>) hit;
//			hmap.keySet().forEach(key -> {
//				Object v = hmap.get(key);
//				ArrayList path2 = new ArrayList(path);
//				path2.add(key);
//				getHeaders(v, path2, headers);
//			});
//			return;
//		}
//		if (hit instanceof List) {
//			List subhit = (List) hit;
//			for(int i=0; i<subhit.size(); i++) {
//				Object sv = subhit.get(i);
//				ArrayList path2 = new ArrayList(path);
//				path2.add(i);
//				getHeaders(sv, path2, headers);
//			};
//			return;
//		}
//		// as is
//		if (path.isEmpty()) return;
//		headers.count(StrUtils.join(path, "."));
//	}

}
