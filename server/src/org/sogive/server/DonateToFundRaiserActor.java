package org.sogive.server;

import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.user.Donation;

import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.utils.Dep;
import com.winterwell.utils.threads.Actor;
import com.winterwell.web.app.AppUtils;

/**
 * Update a fundraiser's donation count + total
 * @author daniel
 *
 */
public class DonateToFundRaiserActor extends Actor<Donation> {

	@Override
	protected void consume(Donation donation, Actor from) throws Exception {
		String frid = donation.getFundRaiser();
		
		updateFundRaiser(donation, frid, KStatus.DRAFT);
		updateFundRaiser(donation, frid, KStatus.PUBLISHED);
		
	}
	
	private void updateFundRaiser(Donation donation, String frid, KStatus status) {
		ESPath path = Dep.get(IESRouter.class).getPath(FundRaiser.class, frid, status);
		FundRaiser fundraiser = AppUtils.get(path, FundRaiser.class);
		
		MonetaryAmount donated = fundraiser.getDonated();
		if (donated == null) donated = MonetaryAmount.pound(0);
		fundraiser.setDonated(donated.plus(donation.getAmount()));
		
		Integer donationCount = fundraiser.getDonationCount();
		if (donationCount == null) donationCount = 0;
		fundraiser.setDonationCount(donationCount + 1);
		
		AppUtils.doSaveEdit2(path, new JThing<FundRaiser>(fundraiser), null);
	}	
}
