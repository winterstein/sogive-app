package org.sogive.data.commercial;

import org.junit.Test;
import org.sogive.data.user.Donation;
import org.sogive.data.user.RepeatDonation;
import org.sogive.server.SoGiveServer;

import com.goodloop.data.KCurrency;
import com.goodloop.data.Money;
import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.web.data.XId;

public class DonationTest {
	@Test
	public void testGsonInMemory() {
		SoGiveServer ss = new SoGiveServer();
		ss.init();

		Gson gson = Dep.get(Gson.class);
		
		XId from = new XId("spoon@gmail.com");		
		String to = "oxfam";
		Money userContribution = new Money(KCurrency.GBP, 1);
		Donation don = new Donation(from, to, userContribution);
		don.setRepeat("WEEK");
		
		String json = gson.toJson(don);
		System.out.println(json);
		
		Object rd2 = gson.fromJson(json);
		
		
		System.out.println(rd2);
	}
}
