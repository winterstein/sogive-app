package org.sogive.server;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.google.common.util.concurrent.ListenableFuture;
import com.winterwell.es.ESPath;
import com.winterwell.es.client.DeleteRequestBuilder;
import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.ESHttpResponse;
import com.winterwell.es.client.GetRequestBuilder;
import com.winterwell.es.client.GetResponse;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.UpdateRequestBuilder;
import com.winterwell.gson.FlexiGson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Printer;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;
import com.winterwell.web.fields.JsonField;
import com.winterwell.web.fields.ListField;
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
	private SoGiveConfig config;
	private ESHttpClient client;
	private String id;

	public CharityServlet(WebRequest state) {
		this.state = state;
	}
	
	public void run() throws IOException {
		id = state.getSlugBits(1);
		String version = state.get("version");		
		NGO charity;
		if (state.actionIs("add")) {
			// add is "special" as the only request that doesn't need an id
			charity = doAdd(version);
		} else {
			charity = getCharity(id, version);
		}
		if (charity==null) {
			throw new WebEx.E404("No charity: "+id);
		}
		// save edits??
		if (state.getAction()!=null) {
			config = Dep.get(SoGiveConfig.class);
			client = new ESHttpClient(Dep.get(ESConfig.class));
			client.debug = true;
			// save edits to draft?
			if (state.actionIs("save")) {
				charity = doSaveEdit();
			}
			if (state.actionIs("publish")) {
				charity = doPublish();
			}
			if (state.actionIs("discard-edits")) {
				charity = doDiscardEdits();
			}
		}
		
//		// impacts
		doCalcImpacts(charity);
		
		JsonResponse output = new JsonResponse(state, charity);
		WebUtils2.sendJson(output, state);
	}

	private NGO doAdd(String version) {
		Map item = (Map) state.get(AppUtils.ITEM);
		boolean isDraft = "draft".equals(version) || version==null;
		assert isDraft : version;
		item.put("modified", isDraft);
		// load from ES, merge, save		
		id = (String) item.get(Thing.ID);
		if (id==null) { // id=null is the normal case
			id = NGO.idFromName((String) item.get("name"));
			item.put(NGO.ID, id);
		}
		assert id != null && ! id.equals("new");
		config = Dep.get(SoGiveConfig.class);
		client = new ESHttpClient(Dep.get(ESConfig.class));
		client.debug = true;
		String idx = isDraft? config.charityDraftIndex : config.charityIndex;		
		IndexRequestBuilder up = client.prepareIndex(idx, config.charityType, id);
		up.setBodyDoc(item);
		IESResponse resp = up.get().check();
//		Map<String, Object> item2 = resp.getParsedJson();
		NGO mod = Thing.getThing(item, NGO.class);
		return mod;
	}

	private NGO doPublish() {
		NGO draft = getCharity(id, "draft");
		draft.put("modified", false);
		
		ESPath draftPath = new ESPath(config.charityDraftIndex, config.charityType, id);
		ESPath publishPath = new ESPath(config.charityIndex, config.charityType, id);
		
		AppUtils.doPublish(draftPath, publishPath);

		return draft;
	}

	private NGO doDiscardEdits() {		
		DeleteRequestBuilder del = client.prepareDelete(config.charityDraftIndex, config.charityType, id);
		IESResponse ok = del.get().check();		
		return getCharity(id, null);
	}

	private NGO doSaveEdit() {
		XId user = state.getUserId(); // TODO save who did the edit + audit trail
		Map item = (Map) state.get(AppUtils.ITEM);		
		// turn it into a charity (runs some type correction)
		NGO mod = Thing.getThing(item, NGO.class);		
		String id = (String) mod.getId();
		assert id != null && ! id.equals("new");		
		String version = state.get("version");
		boolean isDraft = "draft".equals(version) || version==null;
		assert isDraft : version;
		item.put("modified", isDraft);
		
		ESPath path = new ESPath(config.charityDraftIndex, config.charityType, id);
		
		AppUtils.doSaveEdit(path, mod, state);
		
		return mod;
	}

	public static NGO getCharity(String id, String version) {
		ESHttpClient client = new ESHttpClient(Dep.get(ESConfig.class));
		ESHttpClient.debug = true;
		GetRequestBuilder s = new GetRequestBuilder(client);
		
		SoGiveConfig config = Dep.get(SoGiveConfig.class);
		String idx = "draft".equals(version)? config.charityDraftIndex : config.charityIndex;
		assert version==null || "draft".equals(version) : version;
		
		s.setIndex(idx).setType(SoGiveConfig.charityType).setId(id);
		s.setSourceOnly(true);
		GetResponse sr = s.get();
		Exception error = sr.getError();
		if (error!=null) {
			if (error instanceof WebEx.E404) {
				// was version=draft?
				if ("draft".equals(version)) {
					return getCharity(id, null);
				}
				// 404
				return null;
			}
			throw Utils.runtime(error);
		}
		String json = sr.getSourceAsString();
		Map<String, Object> jobj = sr.getParsedJson();		
		Object klass = jobj.get("@class");		
		NGO charity = Thing.getThing(json, NGO.class);
		// Huh? Odd data bug seen May 2017
		if (Utils.isBlank(charity.getId())) {
			charity.put(Thing.ID, id);
		}
		return charity;
	}
	
	private void doCalcImpacts(NGO charity) {
		List<Project> projects = charity.getProjects();
		if (projects==null) {
			return;
		}
		for (Project project : projects) {
			List<Output> alloutputs = project.getOutputs();	
			List<Output> outputs = alloutputs; //Thing.getLatestYear(alloutputs);
			MonetaryAmount unitMoney = MonetaryAmount.pound(1);
			List<Output> impacts = project.getImpact(outputs, unitMoney);
			project.put("impacts", impacts);
		}		
	}

}
