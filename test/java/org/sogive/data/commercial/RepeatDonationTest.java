package org.sogive.data.commercial;

import org.junit.Test;
import org.sogive.server.SoGiveServer;

import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.io.FileUtils;

public class RepeatDonationTest {

	@Test
	public void testGson() {
		String json = FileUtils.read(
				RepeatDonationTest.class.getResourceAsStream("egrepeatdonation.json")
				);
		SoGiveServer ss = new SoGiveServer();
		ss.init();

		Gson gson = Dep.get(Gson.class);
		Object rd = gson.fromJson(json);
		System.out.println(rd);
	}
}
