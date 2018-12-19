package org.sogive.server;

import java.io.IOException;
import java.io.StringWriter;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.sogive.data.commercial.Ticket;

import com.winterwell.data.KStatus;
import com.winterwell.es.IESRouter;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.io.CSVSpec;
import com.winterwell.utils.io.CSVWriter;
import com.winterwell.utils.web.SimpleJson;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.app.WebRequest.KResponseType;

public class EventReportServlet implements IServlet {

	@Override
	public void process(WebRequest state) throws Exception {
		String eventId = state.getSlugBits(1);
		String sub = state.getSlugBits(2);
		// ticket sales?
		
		// ticket list?
		if ("tickets".equals(sub)) {
			returnTicketList(eventId, state);
		}
	}

	private void returnTicketList(String eventId, WebRequest state) throws IOException {
		ESHttpClient es = Dep.get(ESHttpClient.class);
		SearchRequestBuilder s = new SearchRequestBuilder(es);
		IESRouter esRouter = Dep.get(IESRouter.class);
		s.setIndices(esRouter.getPath(Ticket.class, null, KStatus.PUBLISHED).index());
		
		// query ?? cf crudservlet
//		String q = state.get("q");
		QueryBuilder qb = 
				QueryBuilders.boolQuery().must(
						QueryBuilders.termQuery("eventId", eventId)
						);
		
		s.setQuery(qb);
		
		// TODO paging!
		s.setSize(10000);
		s.setDebug(true);
		SearchResponse sr = s.get();
		Map<String, Object> jobj = sr.getParsedJson();
		List<Map> hits = sr.getHits();
		
		// NB: may be Map or AThing
		List hits2 = Containers.apply(hits, h -> h.get("_source"));
				
		// HACK: send back csv?
		if (state.getResponseType() == KResponseType.csv) {
			doSendCsv(state, hits2);
			return;
		}
			
		long total = sr.getTotal();
		String json = Dep.get(Gson.class).toJson(
				new ArrayMap(
					"hits", hits2, 
					"total", total
				));
		JsonResponse output = new JsonResponse(state).setCargoJson(json);
		WebUtils2.sendJson(output, state);		
	}
	
	protected void doSendCsv(WebRequest state, List<Map> hits2) {
		// ?? maybe refactor and move into a default method in IServlet?
		StringWriter sout = new StringWriter();
		CSVWriter w = new CSVWriter(sout, new CSVSpec());
	
		// what headers?
		Set<String> headers = Containers.objectAsMap(new Ticket()).keySet();
		
		// write
		w.write(headers);
		for (Map hit : hits2) {
			List<Object> line = Containers.apply(headers, h -> {
				return SimpleJson.get(hit, h);
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
