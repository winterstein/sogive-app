package org.sogive.data.user;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

import org.sogive.data.charity.Output;
import org.sogive.data.commercial.Event;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.server.payment.IForSale;
import org.sogive.server.payment.StripeAuth;

import com.goodloop.data.Money;
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

public class Donation extends AThing implements IForSale {

	/**
	 * The app that created this - e.g. sogive or goodloop.
	 */
	String a;

	/**
	 * The user's contribution
	 */
	private Money amount;

	Boolean anonAmount;

	Boolean anonymous;

	/**
	 * Whether we think this has been collected. Note that Stripe can reclaim money,
	 * we we have to allow a period before counting this as firm.
	 */
	boolean collected;

	/**
	 * Has the user said OK to sharing their details with the charity?
	 */
	Boolean consentToSharePII;

	/**
	 * Extra money! gift-aid boost + matched funding.
	 */
	List<MoneyItem> contributions;

	/**
	 * When this donation was made
	 */
	String date = new Time().toISOString();

	List<String> done;

	PersonLite donor;

	String donorAddress;

	/**
	 * @Deprecated This should be copied into the donor object
	 */
	private String donorEmail;

	/**
	 * @deprecated This is a "temp" storage, used during drafts, which is then
	 *             copied into the donor object
	 */
	private String donorName;

	String donorPostcode;

	/**
	 * convenience for look up via {@link #fundRaiser} and ES
	 */
	private transient Event event;

	/**
	 * from - who provided this info. There can be multiple sources - e.g. if a bot
	 * infers the data, then both bot and original source should be listed here.
	 * 
	 * NB: see Claim.java in profiler
	 */
	XId[] f;

	/**
	 * Our fees + processing fees.
	 */
	List<MoneyItem> fees;

	/**
	 * The user who donated
	 */
	XId from;

	/**
	 * id for the {@link FundRaiser}, if there was one
	 */
	String fundRaiser;

	/**
	 * If set, this donation was a repeat. This is not set for the first in the
	 * chain.
	 */
	String generator;

	/*
	 * Gift Aid section: HMRC have asked us to change our questions to get more
	 * accurate data: (their instructions were basically "Copy BT MyDonate's form")
	 * - yes/no questions instead of checkboxes, which people just tick without
	 * reading - some questions have "no" as the "correct" answer Some fields have
	 * been deprecated as a result.
	 */
	/** The donor wants to Gift Aid this donation (and is legally able to do so) */
	Boolean giftAid;

	/**
	 * Must be false if giftAid is true. "I am receiving a benefit from this
	 * donation e.g. entry to an event, raffle or sweepstake."
	 */
	Boolean giftAidBenefitInReturn;

	/**
	 * Must be false if giftAid is true. "This is the proceeds from the sale of
	 * goods or provision of service e.g. a cake sale, auction or car wash."
	 */
	Boolean giftAidFundRaisedBySale;

	/** Deprecated: Inverted to {@link giftAidBenefitInReturn} */
	boolean giftAidNoCompensation;

	/**
	 * Must be true if giftAid is true. "This donation is my own money. It has not
	 * come from anyone else e.g. a business, friends, family or a collection."
	 */
	Boolean giftAidOwnMoney;

	/** Must be true if giftAid is true. "I am a UK taxpayer." */
	Boolean giftAidTaxpayer;

	Boolean hasTip;

	private List<Output> impacts;

	String message;

	/**
	 * If true, the money was paid outside of the SoGive system. E.g. cash paid in
	 * directly. Then this record is just to log the donation in SoGive.
	 */
	boolean paidElsewhere;

	boolean paidOut;

	/**
	 * e.g. a stripe charge id
	 */
	@ESKeyword
	String paymentId;

	/**
	 * Stripe | ask-user | usually null
	 */
	String paymentMethod;
	/**
	 * used to create RepeatDonation Uses TUnit strings, WEEK / MONTH
	 */
	private String repeat;

	/**
	 * stop repeating
	 */
	Boolean repeatStopsAfterEvent;

	StripeAuth stripe;

	Money tip;

	/**
	 * the charity id. this is NOT an Xid!
	 */
	@ESKeyword
	String to;

	List<String> todo;

	/**
	 * The total amount the charity will receive.
	 */
	Money total;

	/**
	 * the user who helped raise the funds -- i.e. the walker in KiltWalk.
	 */
	XId via;

	public Donation(XId from, String to, Money userContribution) {
		Utils.check4null(from, to);
		this.from = from;
		this.to = to;
		assert !to.contains("@") : to;
		this.amount = userContribution;
		// HACK: make an ID to block repeats within a couple of minutes
		long tmin = new Time(date).getTime() / (5 * TUnit.MINUTE.millisecs);
		this.id = userContribution.getValue() + " from " + from + " to " + to + " at " + (tmin);
	}

	public void addContribution(MoneyItem matchAmount) {
		if (contributions == null)
			contributions = new ArrayList();
		contributions.add(matchAmount);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (!super.equals(obj))
			return false;
		if (getClass() != obj.getClass())
			return false;
		Donation other = (Donation) obj;
		return Objects.equals(a, other.a) && Objects.equals(amount, other.amount)
				&& Objects.equals(anonAmount, other.anonAmount) && Objects.equals(anonymous, other.anonymous)
				&& collected == other.collected && Objects.equals(consentToSharePII, other.consentToSharePII)
				&& Objects.equals(contributions, other.contributions) && Objects.equals(date, other.date)
				&& Objects.equals(done, other.done) && Objects.equals(donor, other.donor)
				&& Objects.equals(donorAddress, other.donorAddress) && Objects.equals(donorEmail, other.donorEmail)
				&& Objects.equals(donorName, other.donorName) && Objects.equals(donorPostcode, other.donorPostcode)
				&& Arrays.equals(f, other.f) && Objects.equals(fees, other.fees) && Objects.equals(from, other.from)
				&& Objects.equals(fundRaiser, other.fundRaiser) && Objects.equals(generator, other.generator)
				&& Objects.equals(giftAid, other.giftAid)
				&& Objects.equals(giftAidBenefitInReturn, other.giftAidBenefitInReturn)
				&& Objects.equals(giftAidFundRaisedBySale, other.giftAidFundRaisedBySale)
				&& giftAidNoCompensation == other.giftAidNoCompensation
				&& Objects.equals(giftAidOwnMoney, other.giftAidOwnMoney)
				&& Objects.equals(giftAidTaxpayer, other.giftAidTaxpayer) && Objects.equals(hasTip, other.hasTip)
				&& Objects.equals(impacts, other.impacts) && Objects.equals(message, other.message)
				&& paidElsewhere == other.paidElsewhere && paidOut == other.paidOut
				&& Objects.equals(paymentId, other.paymentId) && Objects.equals(paymentMethod, other.paymentMethod)
				&& Objects.equals(repeat, other.repeat)
				&& Objects.equals(repeatStopsAfterEvent, other.repeatStopsAfterEvent)
				&& Objects.equals(stripe, other.stripe) && Objects.equals(tip, other.tip)
				&& Objects.equals(to, other.to) && Objects.equals(todo, other.todo)
				&& Objects.equals(total, other.total) && Objects.equals(via, other.via);
	}

	public String getA() {
		return a;
	}

	/**
	 * @deprecated HACK: amount plus tip! TODO move tip into fees.
	 * @see #getRawAmount()
	 */
	public Money getAmount() {
		// HACK plus tip
		if (Utils.yes(hasTip) && tip != null && tip.getValue100p() > 0) {
			return amount.plus(tip);
		}
		return amount;
	}

	public Boolean getAnonymous() {
		return anonymous;
	}

	public List<MoneyItem> getContributions() {
		return contributions;
	}

	@Override
	public String getDescription() {
		return "to " + to;
	}

	public PersonLite getDonor() {
		return donor;
	}

	public String getDonorAddress() {
		return donorAddress;
	}
	public String getDonorEmail() {
		return donorEmail;
	}

	public String getDonorName() {
		return donorName;
	}

	public String getDonorPostcode() {
		return donorPostcode;
	}

	public Event getEvent() {
		if (event != null)
			return event;
		if (fundRaiser == null)
			return null;
		FundRaiser fr = AppUtils.get(fundRaiser, FundRaiser.class);
		if (fr == null) {
			Log.d("Donation", "fundraiser but no event: " + fundRaiser + " " + this);
			return null;
		}
		event = fr.getEvent();
		return event;
	}

	public XId getFrom() {
		return from;
	}

	public String getFundRaiser() {
		return fundRaiser;
	}

	public String getGenerator() {
		return generator;
	}

	public Boolean getGiftAid() {
		return giftAid;
	}

	public Boolean getHasTip() {
		return hasTip;
	}

	public List<Output> getImpacts() {
		return impacts;
	}

	@Override
	public boolean getPaymentCollected() {
		return collected;
	}
	public String getPaymentId() {
		if (paymentId == null && stripe != null) {
			String sid = stripe.getId();
			return sid;
		}
		return paymentId;
	}

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public Money getRawAmount() {
		return amount;
	}

	public Repeat getRepeat() {
		// stop at fundraiser event?
		Time stopDate = null;
		if (Utils.yes(repeatStopsAfterEvent)) {
			Event event = getEvent();
			if (event != null && event.getDate() != null) {
				stopDate = event.getDate();
			}
		}
		// parse
		return repeatFromString(repeat, stopDate);
	}

	public StripeAuth getStripe() {
		return stripe;
	}

	/**
	 * COnvenience for {@link #date}
	 * 
	 * @return
	 */
	public Time getTime() {
		return new Time(date);
	}

	public Money getTip() {
		return tip;
	}

	public String getTo() {
		return to;
	}
	/**
	 * The total amount the charity will receive.
	 */
	public Money getTotal() {
		Mutable.Ref<com.goodloop.data.Money> ttl = new Mutable.Ref<>(amount);
		if (contributions != null) {
			contributions.forEach(c -> ttl.value = ttl.value.plus(c.money));
		}
		if (fees != null) {
			fees.forEach(c -> ttl.value = ttl.value.minus(c.money));
		}
		total = new Money(ttl.value);
		return total;
	}
	public XId getVia() {
		return via;
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = super.hashCode();
		result = prime * result + Arrays.hashCode(f);
		result = prime * result + Objects.hash(a, amount, anonAmount, anonymous, collected, consentToSharePII,
				contributions, date, done, donor, donorAddress, donorEmail, donorName, donorPostcode, fees, from,
				fundRaiser, generator, giftAid, giftAidBenefitInReturn, giftAidFundRaisedBySale, giftAidNoCompensation,
				giftAidOwnMoney, giftAidTaxpayer, hasTip, impacts, message, paidElsewhere, paidOut, paymentId,
				paymentMethod, repeat, repeatStopsAfterEvent, stripe, tip, to, todo, total, via);
		return result;
	}

	@Deprecated // use setPaymentCollected() instead
	public boolean isCollected() {
		return getPaymentCollected();
	}

	public boolean isPaidElsewhere() {
		return paidElsewhere;
	}

	public void setA(String a) {
		this.a = a;
	}

	public void setDate(String date) {
		this.date = date;
	}

	public void setDonor(PersonLite donor) {
		this.donor = donor;
	}

	public void setDonorAddress(String donorAddress) {
		this.donorAddress = donorAddress;
	}

	public void setDonorEmail(String donorEmail) {
		this.donorEmail = donorEmail;
	}

	public void setDonorName(String donorName) {
		this.donorName = donorName;
	}

	public void setDonorPostcode(String donorPostcode) {
		this.donorPostcode = donorPostcode;
	}

	public void setEvent(Event event) {
		this.event = event;
	}

	public void setF(XId[] f) {
		this.f = f;
	}

	public void setFrom(XId from) {
		this.from = from;
	}

	public void setFundRaiser(String fundRaiser) {
		this.fundRaiser = fundRaiser;
	}

	public void setGenerator(String generator) {
		this.generator = generator;
	}

	public void setGiftAid(Boolean giftAid) {
		this.giftAid = giftAid;
	}

	public void setImpacts(List<Output> impacts) {
		this.impacts = impacts;
	}

	public void setPaidElsewhere(boolean paidElsewhere) {
		this.paidElsewhere = paidElsewhere;
	}

	@Override
	public void setPaymentCollected(boolean b) {
		this.collected = b;
	}

	@Override
	public void setPaymentId(String paymentId) {
		this.paymentId = paymentId;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public void setRepeat(String repeat) {
		this.repeat = repeat;
	}

	public void setStripe(StripeAuth stripe) {
		this.stripe = stripe;
	}

	public void setTo(String to) {
		this.to = to;
	}

	public void setVia(XId via) {
		this.via = via;
	}

	@Override
	public String toString() {
		return "Donation[id=" + id + ", amount=" + amount + ", total to charity=" + getTotal() + ", tip=" + tip + "]";
	}

}
