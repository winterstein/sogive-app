package org.sogive.data.commercial;

import org.junit.Test;
import org.sogive.server.SoGiveServer;

import com.winterwell.web.ajax.JThing;

public class BasketTest {

	@Test
	public void testInit() {
		SoGiveServer sg = new SoGiveServer();
		sg.init();

		Basket basket = new Basket();
		basket.name = "foo";

		JThing jb = new JThing().setJava(basket);

		String json = jb.string();

		System.out.println(json);

		assert json.contains("Basket") : json;
	}

}
