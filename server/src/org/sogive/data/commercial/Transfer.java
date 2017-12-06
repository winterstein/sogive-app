package org.sogive.data.commercial;


import java.util.List;
import java.util.Map;

import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.QueryStringQueryBuilder;
import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.charity.Output;
import org.sogive.data.user.Donation;
import org.sogive.server.payment.StripeAuth;

import com.winterwell.data.AThing;
import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.data.PersonLite;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Mutable;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.data.XId;

import lombok.Data;

/**
* A lightweight object for maintaining an accounting audit trail
* This corresponds to a simple credit-debit transaction in double-entry
* book-keeping.
* 
* This is similar to {@link Donation}, and intentionally uses same field names.
* <p>
* // TODO some audit information - who made this transfer and how
	// Perhaps this is provided by associated events?
	// for every transfer, emit an event where that transfer is the instrument?
* 
* TODO support for currency conversion? just the bald fact of two money amounts?
* or conversion can be modelled more directly me £10-> bank, bank $15-> you
* TODO a status field for pending, published=normal, trash=cancelled?
* TODO debt vs payment
* @author Dan, joe
*/
@Data
public class Transfer extends AThing {
	String note;

	/**
	 * Providing the money
	 */
	XId from;
	
	/**
	 * Receiving the money
	 */
	XId to;
	
	String message;
		
	
	/**
	 * The total amount the `to` will receive.
	 */
	public MonetaryAmount getTotal() {
		Mutable.Ref<MonetaryAmount> ttl = new Mutable.Ref<>(amount);
//		if (contributions!=null) contributions.forEach(c -> ttl.value = ttl.value.plus(c));
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
	
	StripeAuth stripe;

	/**
	 * Our fees + processing fees.
	 */
	List<MonetaryAmount> fees;
	
	/**
	 * The user's contribution
	 */
	MonetaryAmount amount;
		
	/**
	 * The total amount the charity will receive.
	 */
	MonetaryAmount total;	

	/**
	 * When this donation was made
	 */
	String date = new Time().toISOString();

	public Transfer(XId from, XId to, MonetaryAmount amount) {
		Utils.check4null(from, to);
		this.from = from;
		this.to = to;
		this.amount = amount;
		// HACK: make an ID to block repeats within a couple of minutes
		long tmin = new Time(date).getTime() / (5*TUnit.MINUTE.millisecs);
		this.id = amount.getValue()+" from "+from+" to "+to+" at "+(tmin);
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


	public static MonetaryAmount getTotalCredit(XId user) {
		ESHttpClient es = Dep.get(ESHttpClient.class);
		SearchRequestBuilder s = new SearchRequestBuilder(es);		
		String toFrom = user.toString();
		QueryBuilder qb = QueryBuilders.boolQuery()
				.should(QueryBuilders.termQuery("to", toFrom))
				.should(QueryBuilders.termQuery("from", toFrom))
				.minimumNumberShouldMatch(1);
		s.setQuery(qb);
		
		// TODO aggregate
		s.setSize(10000);
		es.debug = true;
		SearchResponse sr = s.get();
		Map<String, Object> jobj = sr.getParsedJson();
		List<Map> hits = sr.getHits();
		
		List hits2 = Containers.apply(hits, h -> h.get("_source"));
		
		MonetaryAmount sum = new MonetaryAmount(0);
		for (Object object : hits2) {
			
		}				
		return sum;
	}


	public JThing publish() {
		JThing draft = new JThing(this);
		ESPath draftPath = Dep.get(IESRouter.class).getPath(Transfer.class, id, KStatus.DRAFT);
		ESPath publishPath = Dep.get(IESRouter.class).getPath(Transfer.class, id, KStatus.PUBLISHED);
		JThing after = AppUtils.doPublish(draft, draftPath, publishPath);
		return after;
	}


}
