package org.sogive.data.user;

import java.io.File;
import java.util.Map;
import java.util.logging.Level;

import org.sogive.data.charity.SoGiveConfig;

import com.winterwell.utils.io.SqlUtils;
import com.winterwell.es.ESType;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.admin.CreateIndexRequest;
import com.winterwell.es.client.admin.PutMappingRequestBuilder;
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

	public static void init() {
		ESHttpClient es = Dependency.get(ESHttpClient.class);
		SoGiveConfig config = Dependency.get(SoGiveConfig.class);
		
		CreateIndexRequest pi = es.admin().indices().prepareCreate(config.donationIndex);
		IESResponse r = pi.get();
		
		PutMappingRequestBuilder pm = es.admin().indices().preparePutMapping(config.donationIndex, "donation");
		ESType dtype = new ESType();
		dtype.property("from", new ESType().keyword());
		dtype.property("to", new ESType().keyword());
		dtype.property("time", new ESType().date());
		pm.setMapping(dtype);
		IESResponse r2 = pm.get();
		r2.check();
		
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
