package org.sogive.data.commercial;

import org.junit.Test;
import org.sogive.data.user.Donation;
import org.sogive.server.SoGiveMain;

import com.goodloop.data.KCurrency;
import com.goodloop.data.Money;
import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.web.data.XId;

public class DonationTest {
	@Test
	public void testGsonInMemory() {
		SoGiveMain ss = new SoGiveMain();
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
