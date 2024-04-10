package org.sogive.data.commercial;

import org.junit.Test;
import org.sogive.server.SoGiveMain;

import com.winterwell.web.ajax.JThing;

public class BasketTest {

	@Test
	public void testInit() {
		SoGiveMain sg = new SoGiveMain();
		sg.init();

		Basket basket = new Basket();
		basket.name = "foo";

		JThing jb = new JThing().setJava(basket);

		String json = jb.string();

		System.out.println(json);

		assert json.contains("Basket") : json;
	}

}
