package org.sogive.server;

import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.user.Person;

import com.winterwell.utils.Dep;
import com.winterwell.utils.TodoException;

public class SoGiveTestUtils {

	static SoGiveServer server;
	
	/**
	 * An in-memory server for unit testing
	 * @return http://localhost:7312
	 */
	public static String getStartServer() {
		if (server==null) {
			server = new SoGiveServer();
			String[] args = new String[] {
				"-port", "7312"
			};
			server.doMain(args);
		}
		SoGiveConfig config = server.getConfig();
		return "http://localhost:"+config.port; 
	}

	public static FundRaiser getTestFundRaiser() {
		// TODO Auto-generated method stub
		return null;
	}

	public static Person doTestUserLogin(String host) {
		// TODO Auto-generated method stub
		return null;
	}

}
