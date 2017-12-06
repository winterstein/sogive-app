package org.sogive.data.commercial;

import static org.junit.Assert.*;

import org.junit.Test;
import org.sogive.data.charity.MonetaryAmount;
import org.sogive.server.SoGiveServer;

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
		
		Transfer t = new Transfer(company, user, new MonetaryAmount(500));
		t.publish();
		
		Utils.sleep(1000);
		
		MonetaryAmount userCred = Transfer.getTotalCredit(user);
		MonetaryAmount coCred = Transfer.getTotalCredit(company);
		MonetaryAmount charityCred = Transfer.getTotalCredit(charity);
		
		assert charityCred.getValue() == 0 : charityCred;
		assert userCred.getValue() == 5 : userCred;
		assert coCred.getValue() == -5 : coCred;
	}

}
