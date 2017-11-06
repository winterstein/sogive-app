package org.sogive.data.commercial;

import static org.junit.Assert.*;

import org.junit.Test;
import org.sogive.server.SoGiveServer;

import com.winterwell.data.JThing;

public class BasketTest {

	@Test
	public void testInit() {
		SoGiveServer sg = new SoGiveServer();
		sg.init();
		
		Basket basket = new Basket();
		
		JThing jb = new JThing().setJava(basket);
		
		String json = jb.string();
		
		System.out.println(json);
		
		fail("Not yet implemented");
	}

}
