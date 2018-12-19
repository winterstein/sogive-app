package org.sogive.server;

import java.util.List;
import java.util.Map;

import org.sogive.data.charity.NGO;
import org.sogive.data.charity.Output;
import org.sogive.data.charity.Project;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.charity.Thing;

import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.WebRequest; 

public class CharityServlet extends CrudServlet<NGO> {

	private final SoGiveConfig config;

	public CharityServlet() {
		super(NGO.class, Dep.get(SoGiveConfig.class));
		config = Dep.get(SoGiveConfig.class);
	}
	
	@Override
	protected void doSave(WebRequest state) {
		super.doSave(state);
		// impacts
		doCalcImpacts(getThing(state));			
	}	

	@Override
	protected JThing<NGO> getThingFromDB(WebRequest state) {	
		JThing<NGO> thing = super.getThingFromDB(state);
		if (thing==null) return null;
		// impacts
		doCalcImpacts(thing.java());
		return thing;
	}
	
	@Override
	public void process(WebRequest state) throws Exception {
		super.process(state);
	}

	public static NGO getCharity(String id, KStatus status) {		
		ESPath path = Dep.get(SoGiveConfig.class).getPath(null, NGO.class, id, status);
		NGO got = AppUtils.get(path, NGO.class);
		if (got==null) return null;
		return got; //new JThing<NGO>().setType(NGO.class).setJava(got).java();
	}
	
	@Override
	protected String getJson(WebRequest state) {
		return state.get(AppUtils.ITEM.getName());
	}
	
	private void doCalcImpacts(NGO charity) {
		List<Project> projects = charity.getProjects();
		if (projects==null) {
			return;
		}
		for (Project project : projects) {
			List<Output> alloutputs = project.getOutputs();	
			List<Output> outputs = alloutputs; //Thing.getLatestYear(alloutputs);
//			MonetaryAmount unitMoney = MonetaryAmount.pound(1);
			for (Output output : outputs) {
				project.calcCostPerOutput(output); //Impact(outputs, unitMoney);	
			}			
//			project.put("impacts", impacts);
		}		
	}

	@Override
	protected JThing<NGO> doNew(WebRequest state, String id) {
		String json = getJson(state);
		Map rawMap = Gson.fromJSON(json);

		// Make sure there's no ID collision!
		NGO existsPublished = getCharity(id, KStatus.PUBLISHED);
		NGO existsDraft = getCharity(id, KStatus.DRAFT);
		assert existsPublished == null && existsDraft == null : state;
		
		// The given ID is OK: put it on the map and construct the NGO
		rawMap.put("@id", id);
		JThing jt = new JThing(Gson.toJSON(rawMap));
		NGO mod = Thing.getThing(jt.map(), NGO.class);
		assert mod.getId().equals(id) : mod+" "+id;
		jt.setJava(mod);
		return jt;
	}
	
	@Override
	protected String getId(WebRequest state) {
		String json = getJson(state);
		Map map = Gson.fromJSON(json);
		if (map == null) return super.getId(state);
		
		String id = (String) map.get("@id");
		if ( ! Utils.isBlank(id)) return id;
		id = (String) map.get("id");
		if ( ! Utils.isBlank(id)) return id;
		
		// deprecated fallback
		String name = (String) map.get("name");
		id = name==null? null : NGO.idFromName(name);
		if (Utils.isBlank(id)) {
			return super.getId(state);
		} else {
			return id;
		}
	}
}
