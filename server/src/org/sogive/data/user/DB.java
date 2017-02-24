package org.sogive.data.user;

import java.io.File;
import java.util.Map;
import java.util.logging.Level;


import com.winterwell.utils.io.SqlUtils;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.utils.Dependency;
import com.winterwell.utils.io.ArgsParser;
import com.winterwell.utils.io.DBUtils.DBOptions;
import com.winterwell.utils.log.Log;
import com.winterwell.web.data.XId;

/**
 * What do we store in SQL? Low latency stuff.
 * 
 *  - Transactions
 *  - Is that it?
 *  
 * @author daniel
 *
 */
public class DB {

	public void init() {
//		DBOptions options = ArgsParser.getConfig(new DBOptions(), 
//									new File("config/sogive.properties"));
//		SqlUtils.setDBOptions(options);
	}

	public static Person getUser(XId id) {
		ESHttpClient es = Dependency.get(ESHttpClient.class);
		Map<String, Object> person = es.get("sogive", "user", id.toString());
		return (Person) person;
	}
}
