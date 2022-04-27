package org.sogive.data.loader;

import java.io.BufferedReader;
import java.io.File;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.sogive.data.charity.NGO;
import org.sogive.data.charity.Thing;

import com.google.gson.JsonSyntaxException;
import com.winterwell.data.KStatus;
import com.winterwell.depot.Depot;
import com.winterwell.depot.Desc;
import com.winterwell.gson.JsonArray;
import com.winterwell.gson.JsonElement;
import com.winterwell.gson.JsonObject;
import com.winterwell.gson.JsonParser;
import com.winterwell.utils.Utils;
import com.winterwell.utils.WrappedException;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.web.FakeBrowser;
import com.winterwell.web.WebEx.E404;
import com.winterwell.web.WebEx.E50X;

/**
 * Charity Commission for England & Wales. This can upload the _basic_ data from
 * their register into SoGive. TODO upload more of what they hold
 * 
 * @author sarah
 *
 */
public class ImportEWCCData {

	public static final String EWCC_REG = "englandWalesCharityRegNum";
	public static final String EWCC_BLOB_SITE = "https://ccewuksprdoneregsadata1.blob.core.windows.net/data";
	public static final String MAIN_FILE = "json/publicextract.charity.zip";
	public static final String ANN_RET_HIST_FILE = "json/publicextract.charity_annual_return_history.zip";
	public static final String TAG = ImportEWCCData.class.getSimpleName();
	
	private static volatile boolean running;
	private static List<String> charityErrors = new ArrayList<>();
	private static Map<String, Integer> statReport = new HashMap<>();
	
	private final DatabaseWriter dbWriter;
	private final String depotServer;
	private int exceptionLimit;
	
	public ImportEWCCData(DatabaseWriter dbWriter, String depotServer, int exLim) {
		this.dbWriter = dbWriter;
		this.depotServer = depotServer;
		this.exceptionLimit = exLim;
	}
	
	public boolean isRunning() {
		return running;
	}
	
	public int getExceptionLimit() {
		return exceptionLimit;
	}
	
	public void setExceptionLimit(int exLim) {
		this.exceptionLimit = exLim;
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
	public String jsonToString(JsonObject jObject, String label) {
		try {
			JsonElement jElement = jObject.get(label);
			return (jElement.isJsonNull()) ? null : jElement.getAsString();
		} catch (NullPointerException e) {
			throw new WrappedException(String.format("Invalid property value, '%s', for data object, '%s'", label, jObject), e);
		} catch (IllegalStateException e) {
			throw new WrappedException("Element is of the type JsonArray but contains more than a single element", e);
		} catch (Exception e) {
			throw e;
		}
	}
	
	/**
	 * Validates amount of allowable charity exceptions by ensuring exception limit isn't too large or exceeds 
	 * array size & thus never throws an exception if all or nearly all entries fail.
	 * Resets exceptionLimit to 10% of charity array size to satisfy conditions. 
	 * 
	 * @param arrSize amount of objects to process
	 */
	protected void validateAndResetExceptionLimit(int arrSize) {
		
		if (exceptionLimit == 0) return;
		
		if (arrSize/exceptionLimit < 10) {
			this.exceptionLimit = arrSize/10;
		}
	}
	
	/**
	 * Processes main charity data from main EWCC file.
	 * Allows for a certain amount of exceptions without halting processing.
	 * 
	 * @param jArray data in JsonArray format
	 * @throws Exception
	 * @see setExceptionLimit(int arrSize)
	 */
	protected void processEWCCMainData(JsonArray jArray) throws Exception {
		
		assert jArray.getClass() == JsonArray.class : " Input not JsonArray type.";
		int jArrSize = jArray.size();
		assert jArrSize > 0 : " No Data in File.";
		
		statReport.put("EWCC_Charities", jArrSize);
		statReport.put("NewNGOs", 0);
		statReport.put("UpdatedNGOs", 0);
		statReport.put("RemovedNGOs", 0);
		statReport.put("ErrorNGOs", 0);
		
		validateAndResetExceptionLimit(jArrSize);
		
		String cName = "";
		int tempCnt = 0;
		for (JsonElement jElem : jArray) {
			try {
				JsonObject charityObj = jElem.getAsJsonObject();				
				
				String cStatus = jsonToString(charityObj, "charity_registration_status");
				if (cStatus.equals("Removed")) {
					statReport.put("RemovedNGOs", statReport.get("RemovedNGOs") + 1);
					continue;
				}
				
				cName = jsonToString(charityObj, "charity_name");
				
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
				
				String ourId = NGO.idFromName(cName);
				
				//check if charity already exists
				KStatus status = dbWriter.contains(ourId);
				
				NGO ngo = new NGO(ourId);			
				for(String key : _ngoTemp.keySet()) {
					String v = _ngoTemp.get(key);
					//remove null values to avoid overwriting
					if (Utils.isBlank(v)) continue;
					//don't overwrite names if charity already exists (EWCC file has them in all caps)
					if (status != KStatus.ABSENT && (key == NGO.name || key == "displayName")) continue;
					ngo.put(key, v);
				}
				
				if (status == KStatus.ABSENT) {
					//use PUBLISHED status to add new charities in updateCharityRecord()
					dbWriter.updateCharityRecord(ngo, KStatus.PUBLISHED);
					statReport.put("NewNGOs", statReport.get("NewNGOs") + 1);
				} else {	
					dbWriter.updateCharityRecord(ngo, status);
					statReport.put("UpdatedNGOs", statReport.get("UpdatedNGOs") + 1);
				}
				
				
			} catch (Exception e) {
				statReport.put("ErrorNGOs", statReport.get("ErrorNGOs") + 1);
				charityErrors.add(cName +": "+ e.toString());
				
				// if too many errors, stop processing & report
				if (charityErrors.size() > exceptionLimit) {
					throw new WrappedException(String.format("Exception limit(%s) exceeded while processing charity imports. Charity Errors: %s", exceptionLimit, charityErrors), e);
				}
			}
			
			tempCnt++;
			// if (tempCnt>100) break;
		}
	}
	
	/**
	 * Converts JSON.zip file to JsonArray for processing
	 * 
	 * @param file zip file in JSON format
	 * @return JsonArray
	 */
	protected JsonArray convertJsonFileToJsonArray(File file) {
		try {
			BufferedReader r = FileUtils.getZIPReader(file);
			JsonElement jElement = new JsonParser().parse(r);
			return jElement.getAsJsonArray();
		} catch (JsonSyntaxException e) {
			throw new WrappedException("EWCC file not in JSON format.", e);
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
		desc.setServer(depotServer);
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
	protected File getAndStoreEWCCFile(String ewccSite, String fileName) throws E50X, E404, Exception {
		
		Desc<File> desc = createDesc(fileName);
		File file = Depot.getDefault().get(desc);
		System.out.println("depot file already exist?: "+file);

		if (file == null) {
			FakeBrowser fb = new FakeBrowser();		
			fb.setMaxDownload(51);
			file = fb.getFile(ewccSite+"/"+WebUtils.urlEncode(fileName));
			Depot.getDefault().put(desc, file);
		}
		return file;
		
	}
	
	/**
	 * Called from ImportDataServlet class or test class
	 * (from command line: curl http://local.sogive.org/import?dataset=EWCC)
	 */
	public synchronized void run() {
		System.out.println("ImportEWCCData running...");
		
		running = true;
		
		try {
			File file = getAndStoreEWCCFile(EWCC_BLOB_SITE, MAIN_FILE);
			
			JsonArray jArray = convertJsonFileToJsonArray(file);
			
			processEWCCMainData(jArray);
			
			if (charityErrors.size() > 0) {
				Log.e(TAG, String.format("Some charities produced errors while processing, but less than exception limit of %s: %s", exceptionLimit, charityErrors));
			}
			
			Log.d(TAG, statReport);
			
		} catch (Throwable e) {
			Log.e(TAG, e.toString());
			Log.d(TAG, statReport);
			
		} finally {
			running = false;
		}
	}

}
