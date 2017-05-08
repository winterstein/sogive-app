package org.sogive.server;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.google.common.util.concurrent.ListenableFuture;
import com.winterwell.es.client.DeleteRequestBuilder;
import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.ESHttpResponse;
import com.winterwell.es.client.GetRequestBuilder;
import com.winterwell.es.client.GetResponse;
import com.winterwell.es.client.IESResponse;
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
		NGO charity = getCharity(id, version);
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

	private NGO doPublish() {
		NGO draft = getCharity(id, "draft");
		draft.put("modified", false);
		// load from ES, merge, save		
		UpdateRequestBuilder up = client.prepareUpdate(config.charityIndex, config.charityType, id);
		up.setDoc(draft);
		up.setDocAsUpsert(true);
		// NB: this doesn't return the merged item :(
		IESResponse resp = up.get().check();

		// OK - delete the draft (ignoring the race condition!)
		DeleteRequestBuilder del = client.prepareDelete(config.charityDraftIndex, config.charityType, id);
		IESResponse ok = del.get().check();		

		return draft;
	}

	private NGO doDiscardEdits() {		
		DeleteRequestBuilder del = client.prepareDelete(config.charityDraftIndex, config.charityType, id);
		IESResponse ok = del.get().check();		
		return getCharity(id, null);
	}

	private NGO doSaveEdit() {
//		String pb = state.getPostBody();
		XId user = state.getUserId();
		Map item = (Map) state.get(new JsonField("item"));
		String version = state.get("version");
		boolean isDraft = "draft".equals(version) || version==null;
		assert isDraft : version;
		item.put("modified", isDraft);
		Log.w("TODO", "save edit "+item+" ");
		// load from ES, merge, save		
		String id = (String) item.get(Thing.ID);
		assert id != null && ! id.equals("new");		
		String idx = isDraft? config.charityDraftIndex : config.charityIndex;		
		UpdateRequestBuilder up = client.prepareUpdate(idx, config.charityType, id);
//		item = new ArrayMap("name", "foo"); // FIXME
		// This should merge against what's in the DB
		up.setDoc(item);
		up.setDocAsUpsert(true);
		// NB: this doesn't return the merged item :(
		IESResponse resp = up.get().check();
//		Map<String, Object> item2 = resp.getParsedJson();
		NGO mod = Thing.getThing(item, NGO.class);
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
		return charity;
	}
	
	private void doCalcImpacts(NGO charity) {
		List<Project> projects = charity.getProjects();
		for (Project project : projects) {
			List<Output> alloutputs = project.getOutputs();	
			List<Output> outputs = Thing.getLatestYear(alloutputs);
			MonetaryAmount unitMoney = MonetaryAmount.pound(1);
			List<Output> impacts = project.getImpact(outputs, unitMoney);
			project.put("impacts", impacts);
		}		
	}

}
