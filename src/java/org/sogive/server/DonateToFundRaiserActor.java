package org.sogive.server;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import org.sogive.data.commercial.Event;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.user.Donation;
import org.sogive.data.user.MoneyItem;

import com.goodloop.data.Money;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.es.client.KRefresh;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.threads.Actor;
import com.winterwell.web.ajax.JThing;
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
			Log.d(getName(), "updateFundRaiser "+donation+" frid: "+frid+" status: "+status+" ...");
			ESPath path = Dep.get(IESRouter.class).getPath(FundRaiser.class, frid, status);
			AtomicLong versionf = new AtomicLong();			
			FundRaiser fundraiser = AppUtils.get(path, FundRaiser.class, versionf);
			
			// avoid double counting
			List<String> dons = fundraiser.getDonations();
			if (dons.contains(donation.getId())) {
				Log.d(getName(), "skip (already seen) updateFundRaiser "+donation+" frid: "+frid+" status: "+status+" ...");
				return;
			}
			dons.add(donation.getId()); // NB: WARNING: If there is then an exception below, this code will not get re-run
			
			// How much?			
			Money amount = donation.getRawAmount();
			
			Throwable hackex = null;
			// Add in matched funding?
			try {
				Event event = fundraiser.getEvent();
				if (event != null && event.getMatchedFunding() != 0) {
					double ma = amount.getValue().doubleValue() * event.getMatchedFunding();
					// round to the penny
					ma = Math.round(ma * 100) / 100.0; // trailing .0 coerces divisor to a float so we don't get long/int division
					Money matchAmount = new Money(amount.getCurrency(), ma);
					MoneyItem mi = new MoneyItem("matched funding", matchAmount);
					// debug paranoia: check for a dupe
					List<MoneyItem> cons = donation.getContributions();
					if (cons!=null) {
						MoneyItem dupe = Containers.first(cons, con -> con !=null && "matched funding".equals(con.getText()));
						if (dupe != null) {
							throw new IllegalStateException("Skip Duplicate matched funding in "+donation.getId()+" "+donation);
						}
					}
					// end paranoia
					// Add the matched funding
					donation.addContribution(mi);
					if (donation.getStatus() != KStatus.PUBLISHED) {
						Log.w(getName(), "Not published?! "+donation+" to "+frid);
					}	
					// save the update to donation
					if (status==KStatus.PUBLISHED) { // this method is called twice for status=draft/published), but we only save Donation the once 
						AppUtils.doPublish(donation, KRefresh.FALSE, true);
					}
				}			
			} catch(Throwable ex) {
				Log.w(getName(), ex);
				hackex = ex;
			}
			
			final Money prevTotal = donation.getTotal();
			Money donated = fundraiser.getDonated();
			if (donated == null) donated = Money.pound(0);
			fundraiser.setDonated(donated.plus(prevTotal));
			
			// how many people? But no repeated +1 for repeats
			if (donation.getGenerator()==null) {
				Integer donationCount = fundraiser.getDonationCount();
				if (donationCount == null) donationCount = 0;
				fundraiser.setDonationCount(donationCount + 1);
				// FIXME race condition vs edits or other donations!
				// Though most edits will funnel through this actor in single file.
				// TODO use an update script, and handle conflict exceptions
				Log.d(getName(), "updateFundRaiser count: "+fundraiser.getDonationCount()+" total: "+fundraiser.getDonated()+" from "+prevTotal+" for "+fundraiser.getId()+" by donation "+donation.getId());
			}
			
			// save
			JThing<FundRaiser> jthing = new JThing<FundRaiser>(fundraiser);
			jthing.version = versionf;
			AppUtils.doSaveEdit2(path, jthing, null, true);
			
			if (hackex != null) throw Utils.runtime(hackex);
		} catch(Throwable ex) {
			Log.e(getName(), ex);
			throw Utils.runtime(ex);
		}
	}	
}
