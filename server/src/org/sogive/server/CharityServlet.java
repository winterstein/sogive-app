package org.sogive.server;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.google.gson.FlexiGson;
import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.GetRequestBuilder;
import com.winterwell.es.client.GetResponse;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.utils.Dependency;
import com.winterwell.utils.Printer;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.SField;

import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.charity.NGO;
import org.sogive.data.charity.Output;
import org.sogive.data.charity.Project;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.charity.Thing; 

public class CharityServlet {

	private final WebRequest state;

	public CharityServlet(WebRequest state) {
		this.state = state;
	}
	
	public void run() throws IOException {
		String id = state.getSlugBits(1);
		NGO charity = getCharity(id);
		if (charity==null) {
			throw new WebEx.E404("No charity: "+id);
		}
//		// impacts
		doCalcImpacts(charity);
		
		JsonResponse output = new JsonResponse(state, charity);
		WebUtils2.sendJson(output, state);
	}

	public static NGO getCharity(String id) {
		ESHttpClient client = new ESHttpClient(Dependency.get(ESConfig.class));
		ESHttpClient.debug = true;
		GetRequestBuilder s = new GetRequestBuilder(client);
		s.setIndex(SoGiveConfig.charityIndex).setType(SoGiveConfig.charityType).setId(id);
		s.setSourceOnly(true);
		GetResponse sr = s.get();
		Exception error = sr.getError();
		if (error!=null) {
			if (error instanceof WebEx.E404) return null;
			throw Utils.runtime(error);
		}
		String json = sr.getSourceAsString();
		Map<String, Object> jobj = sr.getParsedJson();
		Object klass = jobj.get("@class");		
		NGO charity = Thing.getThing(json, NGO.class);
		return charity;
	}
	
	private void doCalcImpacts(NGO charity) {
		List<Project> projects = charity.getProjects();
		List impacts = new ArrayList();
		for (Project project : projects) {
			List<Output> alloutputs = project.getOutputs();	
			List<Output> outputs = getLatestYear(alloutputs);
			MonetaryAmount unitMoney = MonetaryAmount.pound(1);
			List<Output> unitImpact = project.getImpact(outputs, unitMoney);				
			impacts.add(unitImpact);
			project.put("impacts", impacts);
		}		
	}

	private <T extends Thing> List<T> getLatestYear(List<T> inputs) {
		if (inputs.isEmpty()) return inputs;
		double max = inputs.stream().map(t -> Utils.or(t.getDouble("year"), 0.0)).max(Double::compare).get();
		if (max==0) return inputs;
		List<T> yearMatch = Containers.filter(t -> t.getDouble("year") == max, inputs);
		return yearMatch;
	}

}
