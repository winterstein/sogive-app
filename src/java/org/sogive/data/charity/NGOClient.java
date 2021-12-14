package org.sogive.data.charity;

import com.winterwell.web.app.CrudClient;

public class NGOClient extends CrudClient<NGO> {

	public NGOClient() {
		this("https://app/sogive.org/charity");
	}
	public NGOClient(String endpoint) {
		super(NGO.class, endpoint);
	}

}
