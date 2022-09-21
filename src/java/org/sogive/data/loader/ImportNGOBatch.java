package org.sogive.data.loader;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import org.sogive.data.charity.NGO;

import com.winterwell.data.KStatus;
import com.winterwell.utils.web.WebUtils2;

/**
 * Convert json file to NGO Object, and then write them into ES
 * @testby {@link ImportNGOBatchTest}
 * @author wing
 *
 */
public class ImportNGOBatch {
	
	public static void main(String[] args) throws IOException {
		
		// Read file
		Path path = Paths.get("/home/wing/winterwell/sogive-app/src/python/data/top100Dumps.json");
		String content = Files.readString(path);
		
		// Convert file to a list of NGO Objects
		ArrayList<NGO> allNGO = jsonToNGO(content);
		System.out.println(allNGO);
		
		ElasticSearchDatabaseWriter esDbWriter = new ElasticSearchDatabaseWriter();
		for (NGO ngo : allNGO) {
			esDbWriter.updateCharityRecord(ngo, KStatus.DRAFT);
		}
	}
	
	
	public static ArrayList<NGO> jsonToNGO(String json) {
		Object[] charityList = WebUtils2.parseJSON(json);

		ArrayList<NGO> allNGO = new ArrayList<NGO>();
		for (Object i : charityList) {
			Map<String, String> j = (Map) i;
			
			Map<String, String> jsonMap = new HashMap<String, String>() {{
				put("name", j.get("name"));
				put("displayName", j.get("name"));
				put("description", j.get("description"));
				put("url", j.get("domain"));
			}};
			
			String ngoId = String.join("-", j.get("name").replaceAll("[':^&.*()%$#@!/]", "").replaceAll("  ", " ")
					.strip().toLowerCase().split(" "));
			
			NGO ngoObject = new NGO(ngoId) {{
				putAll(jsonMap);
			}};
			allNGO.add(ngoObject);
		}
		
		return allNGO;
	}
}
