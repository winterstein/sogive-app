package org.sogive.data.commercial;

import java.util.Arrays;
import java.util.List;

import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;
import org.sogive.server.payment.StripeAuth;

import com.goodloop.data.Money;
import com.winterwell.data.AThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.KRefresh;
import com.winterwell.es.client.SearchRequest;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.query.ESQueryBuilder;
import com.winterwell.es.client.query.ESQueryBuilders;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Mutable;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.data.XId;

/**
 * Transfer of money from Alice to Bob. A lightweight object for maintaining an
 * accounting audit trail This corresponds to a simple credit-debit transaction
 * in double-entry book-keeping.
 * 
 * This is similar to {@link Donation}, and intentionally uses same field names.
 * <p>
 * // TODO some audit information - who made this transfer and how // Perhaps
 * this is provided by associated events? // for every transfer, emit an event
 * where that transfer is the instrument?
 * 
 * TODO support for currency conversion? just the bald fact of two money
 * amounts? or conversion can be modelled more directly me £10-> bank, bank
 * $15-> you TODO a status field for pending, published=normal, trash=cancelled?
 * TODO debt vs payment
 * 
 * @author Dan, joe
 */
public class Transfer extends AThing {

	/**
	 * 
	 * @param user Can be null (returns null)
	 * @return Can be null
	 */
	public static Money getTotalCredit(XId user) {
		if (user == null) {
			Log.d("Transfer", "no credit for no user");
			return null;
		}
		ESHttpClient es = Dep.get(ESHttpClient.class);
		SearchRequest s = new SearchRequest(es);
		String idx = Dep.get(IESRouter.class).getPath(Transfer.class, null).index();
		s.setIndex(idx);
		String toFrom = user.toString();
		ESQueryBuilder qb = ESQueryBuilders.boolQuery().should(ESQueryBuilders.termQuery("to", toFrom))
				.should(ESQueryBuilders.termQuery("from", toFrom)).minimumNumberShouldMatch(1);
		s.setQuery(qb);

		// TODO aggregate
		s.setSize(10000);
		es.debug = true;
		SearchResponse sr = s.get();
		List<Transfer> hits = sr.getSearchResults(Transfer.class);
		// minor glitch: a transfer from:alice to:alice is only one result, and it gets
		// counted as positive!
		Money sum = Money.pound(0);
		for (Transfer t : hits) {
			if (t.getTo().equals(user)) {
				sum = new Money(sum.plus(t.getAmount()));
			} else {
				sum = sum.minus(t.getAmount());
			}
		}
		return sum;
	}

	/**
	 * The app that created this - e.g. sogive or goodloop.
	 */
	String a;

	/**
	 * The user's contribution
	 */
	Money amount;

	/**
	 * Whether we think this has been collected. Note that Stripe can reclaim money,
	 * we we have to allow a period before counting this as firm.
	 */
	boolean collected;

	/**
	 * When this donation was made
	 */
	String date = new Time().toISOString();

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
	List<Money> fees;

	/**
	 * Providing the money
	 */
	XId from;

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
	String paymentId;

	StripeAuth stripe;

	/**
	 * Receiving the money
	 */
	XId to;

	/**
	 * HACK for passing Person objects around in CreditServlet
	 */
	public transient Person toPerson;

	/**
	 * The total amount the charity will receive.
	 */
	Money total;

	public Transfer(XId from, XId to, Money amount) {
		Utils.check4null(from, to);
		this.from = from;
		this.to = to;
		this.amount = amount;
		// HACK: make an ID to block repeats within a couple of minutes
		long tmin = new Time(date).getTime() / (5 * TUnit.MINUTE.millisecs);
		this.id = amount.getValue() + " from " + from + " to " + to + " at " + (tmin);
	}

	public Money getAmount() {
		return amount;
	}

	public String getId() {
		return id;
	}

	public XId getTo() {
		return to;
	}

	/**
	 * The total amount the `to` will receive.
	 */
	public Money getTotal() {
		Mutable.Ref<Money> ttl = new Mutable.Ref<>(amount);
//		if (contributions!=null) contributions.forEach(c -> ttl.value = ttl.value.plus(c));
		if (fees != null)
			fees.forEach(c -> ttl.value = ttl.value.minus(c));
		total = ttl.value;
		return total;
	}

	public JThing publish() {
		JThing draft = new JThing(this);
		ESPath draftPath = Dep.get(IESRouter.class).getPath(Transfer.class, id, KStatus.DRAFT);
		ESPath publishPath = Dep.get(IESRouter.class).getPath(Transfer.class, id, KStatus.PUBLISHED);
		JThing after = AppUtils.doPublish(draft, draftPath, publishPath, KRefresh.TRUE, true);
		return after;
	}

	public void setCollected(boolean b) {
		this.collected = b;
	}

	@Override
	public String toString() {
		return "Transfer [from=" + from + ", to=" + to + ", message=" + message + ", collected=" + collected
				+ ", paidOut=" + paidOut + ", paidElsewhere=" + paidElsewhere + ", paymentId=" + paymentId + ", amount="
				+ amount + ", total=" + total + ", date=" + date + ", f=" + Arrays.toString(f) + ", a=" + a + ", id="
				+ id + "]";
	}

}
