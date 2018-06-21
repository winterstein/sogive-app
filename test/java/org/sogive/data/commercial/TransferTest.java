package org.sogive.data.commercial;

import static org.junit.Assert.*;

import org.junit.Test;
import org.sogive.data.charity.Money;
import org.sogive.server.SoGiveServer;

import com.goodloop.data.KCurrency;
import com.winterwell.utils.Utils;
import com.winterwell.web.data.XId;

public class TransferTest {

	@Test
	public void testGetTotalCredit() {
		SoGiveServer sg = new SoGiveServer();
		sg.init();
		
		XId user = new XId("user"+Utils.getRandomString(6), "test", false);
		XId company = new XId("company"+Utils.getRandomString(6), "test", false);
		XId charity = new XId("charity"+Utils.getRandomString(6), "test", false);
		
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
