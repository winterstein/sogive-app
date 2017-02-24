package org.sogive.server;

import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.core.json.JsonWriteContext;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.FakeBrowser;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.SField;

public class Login {

	static final String ENDPOINT = "http://localhost:8101/hooru.json";
	static SField JWT = new SField("jwt");
	
	public static Map login(WebRequest state) {
		Map<String, String> cookies = WebUtils2.getCookies(state.getRequest());
		Set<String> ckeys = cookies.keySet();
		Map<String, Object> params = state.getParameterMap();
		Set<String> pkeys = params.keySet();
		String jwt = state.get(JWT);
		// Now verify it
		Map user = verify(jwt);
		return user;
	}

	private static Map verify(String jwt) {
		if (jwt==null) return null;
		FakeBrowser fb = new FakeBrowser();
		Object response = fb.getPage(ENDPOINT, new ArrayMap("action", "verify", "jwt", jwt));
		System.out.println(response);
		return null;
	}

}
