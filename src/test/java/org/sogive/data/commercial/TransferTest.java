package org.sogive.data.commercial;

import org.junit.Test;
import org.sogive.server.SoGiveMain;

import com.goodloop.data.KCurrency;
import com.goodloop.data.Money;
import com.winterwell.utils.Utils;
import com.winterwell.web.data.XId;

public class TransferTest {

	@Test
	public void testGetTotalCredit() {
		SoGiveMain sg = new SoGiveMain();
		sg.init();

		XId user = new XId("user" + Utils.getRandomString(6), "test", false);
		XId company = new XId("company" + Utils.getRandomString(6), "test", false);
		XId charity = new XId("charity" + Utils.getRandomString(6), "test", false);

		Transfer t = new Transfer(company, user, new Money(KCurrency.GBP, 5));
		t.publish();

		Money userCred = Transfer.getTotalCredit(user);
		Money coCred = Transfer.getTotalCredit(company);
		Money charityCred = Transfer.getTotalCredit(charity);

		assert charityCred.getValue().doubleValue() == 0 : charityCred;
		assert userCred.getValue().doubleValue() == 5 : userCred;
		assert coCred.getValue().doubleValue() == -5 : coCred;
	}

}
