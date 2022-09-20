package org.sogive.data.loader;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.sogive.data.charity.NGO;

import com.winterwell.utils.web.WebUtils2;

/**
 * Convert json file to NGO Object, and then write them into ES
 * @author wing
 *
 */
public class ImportNGOBatch {
	
	public static void main(String[] args) throws IOException {
		
		// Read file
		Path path = Paths.get("/home/wing/winterwell/sogive-app/src/python/data/top100Dumps.json");
		String content = Files.readString(path);
		
		ArrayList<NGO> allNGO = jsonToNGO(content);
		System.out.println(allNGO);
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
				put("url", j.get("link"));
			}};
			
			String ngoId = String.join("-", j.get("name").strip().toLowerCase().split(" "));
			
			NGO ngoObject = new NGO(ngoId) {{
				putAll(jsonMap);
			}};
			allNGO.add(ngoObject);
		}
		
		return allNGO;
	}
}
