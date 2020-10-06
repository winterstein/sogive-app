package org.sogive.data.user;

import java.util.ArrayList;
import java.util.List;

import com.goodloop.data.Money;
import org.sogive.data.charity.Output;
import org.sogive.data.commercial.Event;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.server.payment.IForSale;
import org.sogive.server.payment.StripeAuth;

import com.winterwell.data.AThing;
import com.winterwell.data.PersonLite;
import com.winterwell.es.ESKeyword;
import com.winterwell.ical.Repeat;
import com.winterwell.utils.Mutable;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.data.XId;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=true)
public class Donation extends AThing implements IForSale {
	
	Boolean anonymous;
	Boolean anonAmount;
	
	/**
	 * used to create RepeatDonation
	 * Uses TUnit strings, WEEK / MONTH
	 */
	private String repeat;
	
	public Repeat getRepeat() {
		// stop at fundraiser event?
		Time stopDate = null;
		if (Utils.yes(repeatStopsAfterEvent)) {
			Event event = getEvent();
			if (event != null && event.getDate()!=null) {
				stopDate = event.getDate();
			}
		}
		// parse
		return repeatFromString(repeat, stopDate);
	}
	

	/**
	 * stop repeating
	 */
	Boolean repeatStopsAfterEvent;
	
	/**
	 * If set, this donation was a repeat.
	 * This is not set for the first in the chain.
	 */
	String generator;
	
	/**
	 * The user who donated
	 */
	XId from;
	
	/**
	 * the charity id. this is NOT an Xid!
	 */
	@ESKeyword
	String to;
	
	/**
	 * @deprecated This is a "temp" storage, used during drafts, which is then copied into the donor object
	 */
	private String donorName;
	
	/**
	 * @Deprecated This should be copied into the donor object
	 */
	private String donorEmail;	
	
	String donorAddress;
	String donorPostcode;
	

	public String getDonorName() {
		return donorName;
	}
	public String getDonorEmail() {
		return donorEmail;
	}
	
	/**
	 * Has the user said OK to sharing their details with the charity?
	 */
	Boolean consentToSharePII;
	
	String message;
	
	/**
	 * id for the {@link FundRaiser}, if there was one
	 */
	String fundRaiser;
	
	/**
	 * the user who helped raise the funds -- i.e. the walker in KiltWalk.
	 */
	XId via;
	
	
	/**
	 * The total amount the charity will receive.
	 */
	public Money getTotal() {
		Mutable.Ref<com.goodloop.data.Money> ttl = new Mutable.Ref<>(amount);
		if (contributions!=null) {
			contributions.forEach(c -> ttl.value = ttl.value.plus(c.money));
		}
		if (fees!=null) {
			fees.forEach(c -> ttl.value = ttl.value.minus(c.money));
		}
		total = new Money(ttl.value);
		return total;
	}
	

	/**
	 * Whether we think this has been collected. 
	 * Note that Stripe can reclaim money, we we have to allow a period before
	 * counting this as firm.
	 */
	boolean collected;
	
	boolean paidOut;
	
	List<String> done;
	List<String> todo;
	
	/**
	 * If true, the money was paid outside of the SoGive system.
	 * E.g. cash paid in directly. Then this record is just to log the donation in SoGive.
	 */
	boolean paidElsewhere;
	
	/**
	 * Stripe | ask-user | usually null
	 */
	String paymentMethod;	
	
	/**
	 * e.g. a stripe charge id
	 */
	@ESKeyword
	String paymentId;
	
	@Override
	public void setPaymentId(String paymentId) {
		this.paymentId = paymentId;
	}
	
	StripeAuth stripe;
	

	/*
	 * Gift Aid section: HMRC have asked us to change our questions to get more accurate data:
	 * (their instructions were basically "Copy BT MyDonate's form")
	 * - yes/no questions instead of checkboxes, which people just tick without reading
	 * - some questions have "no" as the "correct" answer
	 * Some fields have been deprecated as a result.
	 */
	/** The donor wants to Gift Aid this donation (and is legally able to do so) */
	Boolean giftAid;
	
	/** Must be true if giftAid is true. "This donation is my own money. It has not come from anyone else e.g. a business, friends, family or a collection." */
	Boolean giftAidOwnMoney;
	/** Must be false if giftAid is true. "This is the proceeds from the sale of goods or provision of service e.g. a cake sale, auction or car wash." */
	Boolean giftAidFundRaisedBySale;
	/** Must be false if giftAid is true. "I am receiving a benefit from this donation e.g. entry to an event, raffle or sweepstake." */
	Boolean giftAidBenefitInReturn;
	/** Must be true if giftAid is true. "I am a UK taxpayer." */
	Boolean giftAidTaxpayer;
	
	/** Deprecated: Inverted to {@link giftAidBenefitInReturn} */
	boolean giftAidNoCompensation;
	
	
	
	PersonLite donor;

	/**
	 * Our fees + processing fees.
	 */
	List<MoneyItem> fees;
	
	Boolean hasTip;
	
	Money tip;
	
	
	/**
	 * The user's contribution
	 */
	private Money amount;
	
	/**
	 * @deprecated HACK: amount plus tip!
	 * TODO move tip into fees.
	 * @see #getRawAmount()
	 */
	public Money getAmount() {
		// HACK plus tip
		if (Utils.yes(hasTip) && tip!=null && tip.getValue100p() > 0) {
			return amount.plus(tip);
		}
		return amount;
	}
	
	public Money getRawAmount() {
		return amount;
	}
	
	/**
	 * Extra money! gift-aid boost + matched funding.
	 */
	List<MoneyItem> contributions;
	
	/**
	 * The total amount the charity will receive.
	 */
	Money total;	

	/**
	 * When this donation was made
	 */
	String date = new Time().toISOString();

	private List<Output> impacts;


	public Donation(XId from, String to, Money userContribution) {
		Utils.check4null(from, to);
		this.from = from;
		this.to = to;
		assert ! to.contains("@") : to;
		this.amount = userContribution;
		// HACK: make an ID to block repeats within a couple of minutes
		long tmin = new Time(date).getTime() / (5*TUnit.MINUTE.millisecs);
		this.id = userContribution.getValue()+" from "+from+" to "+to+" at "+(tmin);
	}
	
	@Override
	public void setPaymentCollected(boolean b) {
		this.collected = b;
	}
	
	@Deprecated // use setPaymentCollected() instead
	public boolean isCollected() {
		return getPaymentCollected();
	}
	
	@Override
	public boolean getPaymentCollected() {
		return collected;
	}
	
	/**
	 * from - who provided this info. There can be multiple sources
	 *  - e.g. if a bot infers the data, then both bot and original source should be listed here.
	 *  
	 * NB: see Claim.java in profiler
	 */
	XId[] f;
	
	/**
	 * The app that created this - e.g. sogive or goodloop.
	 */
	String a;
	
	
	/**
	 * convenience for look up via {@link #fundRaiser} and ES
	 */
	private transient Event event;

	@Override
	public String toString() {
		return "Donation[id="+id+"]"; // NB id includes from, to, amount
		// , from=" + from + ", to=" + to + ", total=" + getTotal() + ", time=" + date + "]";
	}

	public void addContribution(MoneyItem matchAmount) {
		if (contributions==null) contributions = new ArrayList();
		contributions.add(matchAmount);
	}
	@Override
	public String getDescription() {
		return "to "+to;
	}
	
	/**
	 * COnvenience for {@link #date}
	 * @return
	 */
	public Time getTime() {
		return new Time(date);
	}
	public Event getEvent() {
		if (event!=null) return event;
		if (fundRaiser==null) return null;
		FundRaiser fr = AppUtils.get(fundRaiser, FundRaiser.class);
		if (fr==null) {
			Log.d("Donation", "fundraiser but no event: "+fundRaiser+" "+this);
			return null;
		}
		event = fr.getEvent();
		return event;
	}
	
}
