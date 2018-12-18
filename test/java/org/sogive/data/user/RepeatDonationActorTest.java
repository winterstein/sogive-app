package org.sogive.data.user;

import org.junit.Test;
import org.sogive.data.charity.Money;

import com.winterwell.web.data.XId;

public class RepeatDonationActorTest {

	@Test
	public void testConsume() throws Exception {
		RepeatDonationActor rda = new RepeatDonationActor();
		XId from = new XId("spoon.mcguffin@gmail.com");
		String to = "oxfam";
		Money userContribution = Money.pound(1);
		Donation donation = new Donation(from, to, userContribution);
		RepeatDonation rd = new RepeatDonation(donation);
		
		rda.consume(rd, null);
	}

}
