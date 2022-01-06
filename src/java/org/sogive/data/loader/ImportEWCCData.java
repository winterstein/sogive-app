package org.sogive.data.loader;

import java.io.BufferedReader;
import java.io.File;

import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.charity.Thing;

import com.winterwell.data.KStatus;
import com.winterwell.depot.Depot;
import com.winterwell.depot.Desc;
import com.winterwell.es.ESPath;
import com.winterwell.gson.JsonArray;
import com.winterwell.gson.JsonElement;
import com.winterwell.gson.JsonObject;
import com.winterwell.gson.JsonParser;
import com.winterwell.maths.stats.distributions.discrete.ObjectDistribution;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.log.KErrorPolicy;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;

/**
 * Charity Commission for England & Wales. This can upload the _basic_ data from
 * their register into SoGive. TODO upload more of what they hold
 * 
 * @author sarah
 *
 */
public class ImportEWCCData {

	public static final String EWCC_REG = "englandWalesCharityRegNum";
	
	private volatile boolean running;

	public boolean isRunning() {
		return running;
	}
	
	private static void doCreateCharity(NGO ngo) {

		ngo.put("uk_giftaid", true);

		SoGiveConfig config;
		if (Dep.has(SoGiveConfig.class)) {
			config = Dep.get(SoGiveConfig.class);
		} else {
			config = AppUtils.getConfig("sogive", new SoGiveConfig(), null);
		}

		String ourId = ngo.getId();
		if (Utils.isBlank(ourId)) {
			ourId = NGO.idFromName(ngo.getName());
			ngo.put(ngo.ID, ourId);
		}
		ESPath draftPath = config.getPath(null, NGO.class, ourId, KStatus.DRAFT);
		ESPath publishPath = config.getPath(null, NGO.class, ourId, KStatus.PUBLISHED);

		JThing item = new JThing().setJava(ngo);
		//AppUtils.doSaveEdit(draftPath, item, null, null);
		AppUtils.doPublish(item, draftPath, publishPath);
		
	}
	
	private static String jsonToString(JsonObject jObject, String label) {
	
		JsonElement jElement = jObject.get(label);
		return (jElement.isJsonNull()) ? null : jElement.getAsString();
		
	}

	private static Desc<File> getDesc() {
		Desc desc = new Desc("json.ewcc.charities.zip", File.class);
		desc.setServer(Desc.CENTRAL_SERVER);
		desc.setTag("sogive");
		desc.put("src", "json_ewcc");
		desc.put("year", 2022);
		return desc;
	}
	
	public synchronized void run() {
		System.out.println("Test ImportEWCCData run");
		running = true;
		
		Desc<File> desc = getDesc();
		Depot.getDefault().setErrorPolicy(KErrorPolicy.ASK);
		File file = Depot.getDefault().get(desc);
		BufferedReader r = FileUtils.getZIPReader(file);
		JsonElement jElement = new JsonParser().parse(r);
		JsonArray jArray = jElement.getAsJsonArray();
		int cnt = 0;
		for (JsonElement jElem : jArray) {
			JsonObject charityObj = jElem.getAsJsonObject();
			String cName = jsonToString(charityObj, "charity_name");
			String cStatus = jsonToString(charityObj, "charity_registration_status");
			String cRegNum = jsonToString(charityObj, "registered_charity_number");
			String cUrl = jsonToString(charityObj, "charity_contact_web");
			
			String ourId = NGO.idFromName(cName);
			
			// Build the NGO object
			// NB: filter out null values, to avoid potentially overwriting existing data 
			ArrayMap<String,String> _ngoTemp = new ArrayMap(
				NGO.name, cName,
				"displayName", cName,
				EWCC_REG, cRegNum,
				Thing.url, cUrl
			);
			NGO ngo = new NGO(ourId);			
			for(String key : _ngoTemp.keySet()) {
				String v = _ngoTemp.get(key);
				if (Utils.isBlank(v)) continue;
				ngo.put(key, v);
			}
			
			// look for a match
			ObjectDistribution<NGO> matches = new CharityMatcher().match(ngo);
			// create if new && not removed
			if (matches.isEmpty()) {
				if (cStatus.equals("Removed")) continue;
				doCreateCharity(ngo);
				System.out.println("New charity created: "+ cName);
			} else {
				// TODO merge/update
				if (cStatus.equals("Removed")) {
					// mark inactive? if not, can check if removed before looking for matches to save time
				}
				// if matches > 1, throw error?
				for (NGO mNGO : matches) {
					System.out.println("existing match: "+ mNGO.getDisplayName());
				}
			}
			
			cnt++;
			if (cnt>5) break;
		}
		
		running = false;
	}

	/*
	public static void main(String[] args) {
		
		new SoGiveServer().init();
		
		new ImportCCEWData().run();
	}
	*/

}
