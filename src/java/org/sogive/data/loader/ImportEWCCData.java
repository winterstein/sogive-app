package org.sogive.data.loader;

import java.io.BufferedReader;
import java.io.File;
import java.time.YearMonth;

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
import com.winterwell.utils.web.WebUtils;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.CrudClient;
import com.winterwell.web.FakeBrowser;

/**
 * Charity Commission for England & Wales. This can upload the _basic_ data from
 * their register into SoGive. TODO upload more of what they hold
 * 
 * @author sarah
 *
 */
public class ImportEWCCData {

	public static final String EWCC_REG = "englandWalesCharityRegNum";
	public static final String EWCC_BLOB_ENDPOINT = "https://ccewuksprdoneregsadata1.blob.core.windows.net/data/json";
	public static final String MAIN_FILE = "publicextract.charity.zip";
	public static final String ANN_RET_HIST_FILE = "publicextract.charity_annual_return_history.zip";
	private volatile boolean running;

	public boolean isRunning() {
		return running;
	}
	
	private static void doCreateCharity(NGO ngo) {

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

	private static Desc<File> createDesc(String fileName) {
		Desc desc = new Desc(fileName, File.class);
		desc.setServer(Desc.CENTRAL_SERVER);
		desc.setTag("sogive");
		desc.put("src", "ewcc");
		/*
		will the charity commission be issuing yearly updates?
		the code will check if a desc already exists & use that so we'll want to change
		the desc every time we grab an update. I'm just grabbing the current year
		 */
		int currentYear = YearMonth.now().getYear();
		desc.put("year", currentYear);
		return desc;
	}
	
	public static File getEWCCFile(String fileName) {
		
		/*
		could not get build tasks to recognize added method in CrudClient
		for getFile(), even after cleaning & rebuilding all projects,
		but changes to FakeBrowser were recognized so idk
		*/
		// CrudClient<File> cl = new CrudClient<>(File.class, EWCC_BLOB_ENDPOINT);
		// File resp = cl.getFile(fileName);
		
		FakeBrowser fb = new FakeBrowser();
		/*
		MAX_DOWNLOAD is private. The file is too large for the current limit.
		So either the limit needs to be changed to the following in FakeBrowser class,
		or is should be made public to change here. It may need to be higher depending
		on how large the other files will be. I don't know the purpose of the multipliers
		so I just changed the 10 to 51 (the lowest that would allow the file to download)
		*/
		// fb.MAX_DOWNLOAD = 51 * 1024 * 1024;
		return fb.getFile(EWCC_BLOB_ENDPOINT+"/"+WebUtils.urlEncode(fileName));
	}
	
	public synchronized void run() {
		System.out.println("Test ImportEWCCData run");
		running = true;
		
		// check if file has already been downloaded & added to Depot
		Desc<File> desc = createDesc(MAIN_FILE);
		File file = Depot.getDefault().get(desc);
		System.out.println("depot file already exist?: "+file);
		// if no stored file, grab file from ewcc website & store in Depot
		if (file == null) {
			file = getEWCCFile(MAIN_FILE);
			Depot.getDefault().put(desc, file);
		}
		System.out.println("start processing file...");
		
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
			String giftAid = jsonToString(charityObj, "charity_gift_aid");
			
			String ourId = NGO.idFromName(cName);
			
			// Build the NGO object
			// NB: filter out null values, to avoid potentially overwriting existing data 
			ArrayMap<String,String> _ngoTemp = new ArrayMap(
				NGO.name, cName,
				"displayName", cName,
				EWCC_REG, cRegNum,
				Thing.url, cUrl,
				"uk_giftaid", giftAid
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
				// if matches > 2, throw error? (2 matches per; will investigate)
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
