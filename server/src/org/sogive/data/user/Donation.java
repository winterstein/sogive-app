package org.sogive.data.user;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.charity.Output;
import org.sogive.server.payment.StripeAuth;

import com.winterwell.data.AThing;
import com.winterwell.data.PersonLite;
import com.winterwell.es.ESPath;
import com.winterwell.utils.Mutable;
import com.winterwell.utils.Utils;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.data.XId;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=true)
public class Donation extends AThing {

	/**
	 * The user who donated
	 */
	XId from;
	
	/**
	 * the charity id
	 */
	String to;
	
	String donorAddress;
	String donorPostcode;
	
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
	public MonetaryAmount getTotal() {
		Mutable.Ref<MonetaryAmount> ttl = new Mutable.Ref<>(amount);
		if (contributions!=null) contributions.forEach(c -> ttl.value = ttl.value.plus(c));
		if (fees!=null) fees.forEach(c -> ttl.value = ttl.value.minus(c));
		total = ttl.value;
		return total;
	}
	

	/**
	 * Whether we think this has been collected. 
	 * Note that Stripe can reclaim money, we we have to allow a period before
	 * counting this as firm.
	 */
	boolean collected;
	
	boolean paidOut;
	
	/**
	 * If true, the money was paid outside of the SoGive system.
	 * E.g. cash paid in directly. Then this record is just to log the donation in SoGive.
	 */
	boolean paidElsewhere;
	
	/**
	 * e.g. a stripe charge id
	 */
	String paymentId;
	
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
	/** Now has explanatory text on "I want to Gift Aid this donation" checkbox which makes {@link giftAidTaxPayer} redundant. */
	boolean giftAid;
	
	/** Must be true if giftAid is true. "This donation is my own money. It has not come from anyone else e.g. a business, friends, family or a collection." */
	boolean giftAidOwnMoney;
	/** Must be false if giftAid is true. "This is the proceeds from the sale of goods or provision of service e.g. a cake sale, auction or car wash." */
	boolean giftAidFundRaisedBySale;
	/** Must be false if giftAid is true. "I am receiving a benefit from this donation e.g. entry to an event, raffle or sweepstake." */
	boolean giftAidBenefitInReturn;
	
	/** Deprecated: Inverted to {@link giftAidBenefitInReturn} */
	boolean giftAidNoCompensation;
	/** Deprecated: Implicit in {@link giftAid} */ 
	boolean giftAidTaxpayer;
	
	PersonLite donor;

	/**
	 * Our fees + processing fees.
	 */
	List<MonetaryAmount> fees;
	
	/**
	 * The user's contribution
	 */
	MonetaryAmount amount;
	
	/**
	 * Extra money! gift-aid boost + matched funding.
	 */
	List<MonetaryAmount> contributions;
	
	/**
	 * The total amount the charity will receive.
	 */
	MonetaryAmount total;	

	/**
	 * When this donation was made
	 */
	String date = new Time().toISOString();

	private List<Output> impacts;


	public Donation(XId from, String to, MonetaryAmount userContribution) {
		Utils.check4null(from, to);
		this.from = from;
		this.to = to;
		assert ! to.contains("@") : to;
		this.amount = userContribution;
		// HACK: make an ID to block repeats within a couple of minutes
		long tmin = new Time(date).getTime() / (5*TUnit.MINUTE.millisecs);
		this.id = userContribution.getValue()+" from "+from+" to "+to+" at "+(tmin);
	}

	public String getId() {
		return id;
	}

	public void setCollected(boolean b) {
		this.collected = b;
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

	@Override
	public String toString() {
		return "Donation[from=" + from + ", to=" + to + ", total=" + getTotal() + ", time=" + date + "]";
	}

	public void setImpacts(List<Output> impacts) {
		this.impacts = impacts;
	}

	public void setGiftAid(String name, String address, String postcode) {
		Utils.check4null(name, address, postcode);
		//		this.donorName = name; part of the user info
		this.donor = AppUtils.getCreatePersonLite(from);
		this.donorAddress = address;
		this.donorPostcode = postcode;
	}
}
