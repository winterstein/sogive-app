package org.sogive.data.user;

import org.junit.Test;
import org.sogive.server.SoGiveServer;

import com.winterwell.web.ajax.JThing;

public class DonationTest {

	/**
	 * NB: Investigating a bug where the client was returning "yes"/"no" instead of true/false.
	 */
	@Test
	public void testDonationFromJson() {
		// init gson
		SoGiveServer server = new SoGiveServer();
		server.init();

		String json = "{\"@class\":\"org.sogive.data.user.Donation\",\"from\":\"daniel@sodash.com@email\",\"to\":\"against-malaria-foundation\",\"collected\":false,\"paidOut\":false,\"paidElsewhere\":false,\"giftAid\":false,\"giftAidOwnMoney\":\"yes\",\"giftAidFundRaisedBySale\":\"no\",\"giftAidBenefitInReturn\":\"no\",\"giftAidTaxpayer\":true,\"giftAidNoCompensation\":false,\"amount\":{\"@class\":\"org.sogive.data.charity.Money\",\"year\":0,\"currency\":\"GBP\",\"value100p\":100000,\"value\":\"10\"},\"id\":\"SKxBKX4gPB\",\"status\":\"DRAFT\"}";
		JThing jt = new JThing(json).setType(Donation.class);
		String json2 = jt.toJSONString().replaceAll("\\s", "");
		assert json.contains("\"giftAidTaxpayer\":true");
		assert json2.contains("\"giftAidTaxpayer\":true") : json2;
		Donation don = (Donation) jt.java();
		assert don.giftAidTaxpayer == true : json;
	}

}
