package org.sogive.server;

import org.sogive.data.charity.Money;
import org.sogive.data.commercial.Event;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.user.Donation;
import org.sogive.data.user.MoneyItem;

import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
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
		
		updateFundRaiser(donation, frid, KStatus.PUBLISHED);
		updateFundRaiser(donation, frid, KStatus.DRAFT);				
	}
	
	/**
	 * 
	 * @param donation
	 * @param frid
	 * @param status draft or published version of the FundRaiser
	 */
	private void updateFundRaiser(Donation donation, String frid, KStatus status) {
		try {
			Log.d(getName(), "updateFundRaiser "+donation+" frid: "+frid+" status: "+status);
			ESPath path = Dep.get(IESRouter.class).getPath(FundRaiser.class, frid, status);
			FundRaiser fundraiser = AppUtils.get(path, FundRaiser.class);
					
			Money amount = donation.getAmount();
			
			Throwable hackex = null;
			// Add in matched funding?
			try {
				Event event = fundraiser.getEvent();
				if (event != null && event.getMatchedFunding() != null && event.getMatchedFunding() != 0) {
					double ma = amount.getValue100() * event.getMatchedFunding() / 100.0;
					Money matchAmount = new Money(Math.round(ma), amount.getCurrency());
					MoneyItem mi = new MoneyItem("matched funding", matchAmount.asMoney());
					donation.addContribution(mi);
					if (donation.getStatus() != KStatus.PUBLISHED) {
						Log.w(getName(), "Not published?! "+donation+" to "+frid);
					}	
					// save the update to donation
					if (status==KStatus.PUBLISHED) { // this method is called twice for status=draft/published), but we only save Donation the once 
						AppUtils.doPublish(donation, false, true);
					}
				}			
			} catch(Throwable ex) {
				Log.e(getName(), ex);
				hackex = ex;
			}
			
			final Money prevTotal = donation.getTotal();
			Money donated = fundraiser.getDonated();
			if (donated == null) donated = Money.pound(0);
			fundraiser.setDonated(donated.plus(prevTotal));
			
			Integer donationCount = fundraiser.getDonationCount();
			if (donationCount == null) donationCount = 0;
			fundraiser.setDonationCount(donationCount + 1);
			// for debugging -- a rough log of who has donated
			fundraiser.getDonations().add(donation.getId());
			// FIXME race condition vs edits or other donations!
			// TODO use an update script, and handle conflict exceptions
			Log.d(getName(), "updateFundRaiser count: "+fundraiser.getDonationCount()+" total: "+fundraiser.getDonated()+" from "+prevTotal+" for "+fundraiser.getId());
			AppUtils.doSaveEdit2(path, new JThing<FundRaiser>(fundraiser), null);
			if (hackex != null) throw Utils.runtime(hackex);
		} catch(Throwable ex) {
			Log.e(getName(), ex);
			throw Utils.runtime(ex);
		}
	}	
}
