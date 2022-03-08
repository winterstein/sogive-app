package org.sogive.data.loader;

import java.io.BufferedReader;
import java.io.File;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

import org.sogive.data.charity.NGO;
import org.sogive.data.charity.Thing;

import com.winterwell.data.KStatus;
import com.winterwell.depot.Depot;
import com.winterwell.depot.Desc;
import com.winterwell.gson.JsonArray;
import com.winterwell.gson.JsonElement;
import com.winterwell.gson.JsonObject;
import com.winterwell.gson.JsonParser;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils;
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
	public static final String TAG = ImportEWCCData.class.getSimpleName();
	private volatile boolean running;
	
	private final DatabaseWriter dbWriter;
	private final String depotServer;
	
	public ImportEWCCData(DatabaseWriter dbWriter, String depotServer) {
		this.dbWriter = dbWriter;
		this.depotServer = depotServer;
	}
	
	public boolean isRunning() {
		return running;
	}
	
	public String getDepotServer() {
		return depotServer;
	}

	protected ArrayMap processEWCCMainFile(File file) throws Exception {
		List<String> newCharities = new ArrayList<>();
		List<String> updatedCharities = new ArrayList<>();
		ArrayMap<String,Exception> errorCharities = new ArrayMap<>();
		String cName = "";
		
		BufferedReader r = FileUtils.getZIPReader(file);
		JsonElement jElement = new JsonParser().parse(r);
		JsonArray jArray = jElement.getAsJsonArray();
		int cnt = 0;
		for (JsonElement jElem : jArray) {
			try {
				JsonObject charityObj = jElem.getAsJsonObject();
				cName = jsonToString(charityObj, "charity_name");
				String cStatus = jsonToString(charityObj, "charity_registration_status");
				if (cStatus.equals("Removed")) {
					//System.out.println("EWCC charity status removed: "+ cName);
					continue;
				}
				
				String ourId = NGO.idFromName(cName);
				
				ArrayMap<String,String> _ngoTemp = new ArrayMap(
					NGO.name, cName,
					"displayName", cName,
					EWCC_REG, jsonToString(charityObj, "registered_charity_number"),
					"description", jsonToString(charityObj, "charity_activities"),
					Thing.url, jsonToString(charityObj, "charity_contact_web"),
					"email", jsonToString(charityObj, "charity_contact_email"),
					"phone", jsonToString(charityObj, "charity_contact_phone"),
					"uk_giftaid", jsonToString(charityObj, "charity_gift_aid")
				);
				
				//check if charity already exists
				KStatus status = dbWriter.contains(ourId);
				System.out.println("Kstatus: "+status);
				
				NGO ngo = new NGO(ourId);			
				for(String key : _ngoTemp.keySet()) {
					String v = _ngoTemp.get(key);
					//remove null values to avoid overwriting
					if (Utils.isBlank(v)) continue;
					//don't overwrite names if charity already exists (EWCC file has them in all caps)
					if (status != KStatus.ABSENT && (key == NGO.name || key == "displayName")) continue;
					ngo.put(key, v);
				}
				
				//PUBLISHED status to add new charities in updateCharityRecord()
				if (status == KStatus.ABSENT) {
					status = KStatus.PUBLISHED;
					newCharities.add(cName);
				} else {								
					updatedCharities.add(cName);
				}
				
				dbWriter.updateCharityRecord(ngo, status);
				
				
			} catch (Exception e) {
				//should I use Log.e() here as well?
				errorCharities.put(cName, e);
				if (errorCharities.size() > 4) {
					throw e;
				}
			}
			
			cnt++;
			if (cnt>5) break;
		}
		
		return new ArrayMap("newCharities", newCharities, "updatedCharities", updatedCharities, "errorCharities", errorCharities);
	}
	
	/**
	 * Check if JSON value is null before trying to convert to String.
	 * Returns null if JsonNull, else returns string conversion
	 * 
	 * @param jObject JSON object for charity
	 * @param label property name
	 * @return String value or null
	 * @throws Exception 
	 */
	public String jsonToString(JsonObject jObject, String label) throws Exception {
		try {
			JsonElement jElement = jObject.get(label);
			return (jElement.isJsonNull()) ? null : jElement.getAsString();
		} catch (NullPointerException e) {
			Log.e(TAG, String.format("Invalid property value, '%s', for data object, '%s', from EWCC file: %s", label, jObject, e.getMessage()));
			throw new Exception(String.format("Invalid property value, '%s', for data object, '%s', from EWCC file.", label, jObject), e);
		}
	}

	/**
	 * Create description for file artifact by file name & year of import
	 * 
	 * @param fileName
	 * @return Desc object
	 */
	protected Desc<File> createDesc(String fileName) {
		Desc desc = new Desc(fileName, File.class);
		desc.setServer(getDepotServer());
		desc.setTag("sogive");
		desc.put("src", "ewcc");
		/*
		I'm assuming the EWCC will update the register annually & we will be running this script annually.
		So the files will be sorted by name & year in the Depot.
		 */
		int currentYear = YearMonth.now().getYear();
		desc.put("year", currentYear);
		return desc;
	}
	
	/**
	 * Checks if this year's EWCC file is already stored in Depot & uses stored file.
	 * If file not in Depot, it will download file from EW Charity Commission site & add it to Depot.
	 * 
	 * @param fileName file to be retrieved from Depot or downloaded from EWCC site
	 * @return File object
	 */
	protected File getAndStoreEWCCFile(String fileName) {
		
		Desc<File> desc = createDesc(fileName);
		File file = Depot.getDefault().get(desc);
		System.out.println("depot file already exist?: "+file);

		if (file == null) {
			/*
			Note: The main EWCC file is too large for the current MAX_DOWNLOAD limit in the FakeBrowser class.
			So I updated the limit in FB from 10 to 51, which is the minimum for the main file size.
			*/
			FakeBrowser fb = new FakeBrowser();		
			file = fb.getFile(EWCC_BLOB_ENDPOINT+"/"+WebUtils.urlEncode(fileName));
			Depot.getDefault().put(desc, file);
		}
		return file;
	}
	
	/*
	 * Called from ImportDataServlet class or test class
	 * (from command line: curl http://local.sogive.org/import?dataset=EWCC)
	 */
	public synchronized ArrayMap run() {
		System.out.println("ImportEWCCData running...");
		running = true;
		
		try {
			File file = getAndStoreEWCCFile(MAIN_FILE);
			return processEWCCMainFile(file);
			
		} catch (Throwable ex) {
			throw Utils.runtime(ex);
		} finally {
			running = false;
		}
	}

}
