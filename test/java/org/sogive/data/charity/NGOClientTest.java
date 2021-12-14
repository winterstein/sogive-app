package org.sogive.data.charity;

import static org.junit.Assert.*;

import org.junit.Test;

import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Printer;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.ISiteConfig;
import com.winterwell.youagain.client.AuthToken;
import com.winterwell.youagain.client.YouAgainClient;

public class NGOClientTest {

	@Test
	public void testGet() {
		NGOClient cc = getClient();
		JThing<NGO> joxfam = cc.get("oxfam");
		NGO oxfam = joxfam.java();
		assert oxfam != null;
		Printer.out(oxfam);
	}

	private NGOClient getClient() {
		Dep.setIfAbsent(Gson.class, new Gson());
		NGOClient cc = new NGOClient("https://test.sogive.org/charity");
		ISiteConfig config = null;
		// TODO
//		AuthToken auth = AppUtils.initAppAuth(config, "sogive.org");
//		if (auth == null) {
//			
//		} else {
//			cc.setJwt(auth.getToken());	
//		}
		return cc;
	}

	@Test
	public void testPublish() {
		NGOClient cc = getClient();
		NGO mod = new NGO("test-client");
		mod.put("name", "Test of NGOCLient");
		cc.publish(mod);
		
	}

}
