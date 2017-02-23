package org.sogive.server;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.GetRequestBuilder;
import com.winterwell.es.client.GetResponse;
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
import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.charity.Project;
import org.sogive.data.charity.SoGiveConfig; 

public class CharityServlet {

	private final WebRequest state;

	public CharityServlet(WebRequest state) {
		this.state = state;
	}
	
	public void run() throws IOException {
		String id = state.getSlugBits(1);
		ESHttpClient client = new ESHttpClient(Dependency.get(ESConfig.class));
		ESHttpClient.debug = true;
		GetRequestBuilder s = new GetRequestBuilder(client);
		s.setIndex(SoGiveConfig.charityIndex).setType(SoGiveConfig.charityType).setId(id);
		s.setSourceOnly(true);
		GetResponse sr = s.get();
		Map<String, Object> jobj = sr.getParsedJson();
		Map<String, Object> charity = sr.getSourceAsMap();
		
//		// impacts
		doCalcImpacts(charity);
		
		JsonResponse output = new JsonResponse(state, charity);
		WebUtils2.sendJson(output, state);
	}

	private void doCalcImpacts(Map<String, Object> charity) {
		Project project;
		System.out.println(charity.getClass());
//		List<MonetaryAmount> inputs = project.getInputs();
	}

}
