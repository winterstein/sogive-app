package org.sogive.server;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.eclipse.jetty.util.ajax.JSON;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.TermQueryBuilder;
import org.sogive.data.charity.Money;
import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.commercial.Transfer;
import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;
import org.sogive.data.user.DBSoGive;
import org.sogive.server.payment.StripeAuth;
import org.sogive.server.payment.StripePlugin;

import com.goodloop.data.PaymentException;
import com.stripe.exception.APIException;
import com.stripe.model.Charge;
import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.data.PersonLite;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.UpdateRequestBuilder;
import com.winterwell.gson.FlexiGson;
import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Key;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;
import com.winterwell.web.fields.Checkbox;
import com.winterwell.web.fields.DoubleField;
import com.winterwell.web.fields.IntField;
import com.winterwell.web.fields.JsonField;
import com.winterwell.web.fields.LongField;
import com.winterwell.youagain.client.AuthToken;
import com.winterwell.youagain.client.YouAgainClient;

/**
 * TODO action=donate 
 * 
 * TODO log stripe token 
 * 
 * TODO make donation
 * 
 * TODO list donations
 * 
 * @author daniel
 * @testedby {@link DonationServletTest}
 */
public class DonationServlet extends CrudServlet {

	private static final String LOGTAG = "DonationServlet";

	public DonationServlet() {
		super(Donation.class);
	}

	/*public void process(WebRequest state) throws Exception {
		// crud + list
		super.process(state);
	}*/
	
	@Override
	protected void doList(WebRequest state) throws IOException {
		super.doList(state);
	}
		
	@Override
	protected QueryBuilder doList2_query(WebRequest state) {
		if ("all".equals(state.getSlugBits(2))) {
			return null; // All!
		}
		// support from:user to:charity, so this can find draft donations
		XId user = state.getUserId();
		if (user==null) return null;
		TermQueryBuilder qb = QueryBuilders.termQuery("from", user.toString());
		
		String to = state.get("to");
		if (to==null) return qb;
		
		// would ?q=to:id work just as well??
		QueryBuilder tq = QueryBuilders.termQuery("to", to);;
		
		BoolQueryBuilder qb2 = QueryBuilders.boolQuery().must(qb).must(tq);
		return qb2;
	}
	
	@Override
	protected JThing doPublish(WebRequest state) {
		XId user = state.getUserId();
		String email = state.get("stripeEmail");
		if (user==null && email!=null) {
			user = new XId(email, "Email");
		}
		
		// make/save Donation
		super.doSave(state);
		Donation donation = (Donation) jthing.java();
		donation.setF(new XId[]{user}); // who reported this? audit trail
		// make sure it has a date and some donor info
		if (donation.getDate()==null) {
			donation.setDate(new Time().toISOString());
			jthing.setJava(donation); // Is this needed to avoid any stale json?
		}
		if (donation.getDonor()==null) {
			PersonLite peepLite = AppUtils.getCreatePersonLite(donation.getFrom());
			donation.setDonor(peepLite);
			jthing.setJava(donation); // Is this needed to avoid any stale json?
		}
		
		// Donating to/via a fundraiser? Update its donation total.
		String frid = donation.getFundRaiser();
		if (frid != null && !frid.isEmpty()) {
			ESPath frPath = new ESPath(frid, frid, frid);
			FundraiserServlet fart = new FundraiserServlet();
			DonateToFundRaiserActor dtfa = Dep.get(DonateToFundRaiserActor.class);
			dtfa.send(donation);
		}
						
		// collect the money
		if (donation.isPaidElsewhere()) {
			Log.d(LOGTAG, "paid elsewhere "+donation);
		} else {
			doCollectMoney(donation, state, user);
		}
		// store in the database TODO use an actor which can retry
		super.doPublish(state);
		return jthing;
	}

	private void doCollectMoney(Donation donation, WebRequest state, XId user) {
		Money total = donation.getTotal();
		
		// paid on credit?		
		StripeAuth sa = donation.getStripe();
		boolean allOnCredit = false;
		if (sa != null && StripeAuth.credit_token.equals(sa.id)) {
			allOnCredit = true;
		}		
		Money credit = Transfer.getTotalCredit(user);
		if (credit!=null && credit.getValue() > 0) {
			Money residual = doCollectMoney2(donation, state, user, credit, allOnCredit);
			if (residual==null || residual.getValue()==0) {
				return;
			}
			Log.d(LOGTAG, "part payment on credit "+donation+" residual: "+residual);
			total = residual;
		}
		
		// TODO Less half-assed handling of Stripe exceptions
		try {
			/** Donation has provision to store a StripeAuth now - may already be on the object */
			// take payment
			String ikey = donation.getId();
			Person userObj = DBSoGive.getCreateUser(user);

			if (StripeAuth.SKIP_TOKEN.equals(sa.id)) {
				Log.d(LOGTAG, "skip payment: "+donation);
				return; 
			}
			if (sa == null) {
				sa = new StripeAuth(userObj, state);
			}
			
			Charge charge = StripePlugin.collect(total, donation.getId(), sa, userObj, ikey);
			Log.d("stripe.collect", charge);
			donation.setPaymentId(charge.getId());
			donation.setCollected(true);			
			// FIXME
//			pi.setRefresh("true");
//			pi.setOpTypeCreate(true);				
			// check we haven't done before: done by the op_type=create			
		} catch(Exception e) {
			throw new RuntimeException(e);
		}

	}

	private Money doCollectMoney2(Donation donation, WebRequest state, XId user, 
			Money credit, boolean allOnCredit) 
	{		
		// TODO check credit more robustly
		XId to = NGO.xidFromId(donation.getTo());
		Money amount = donation.getAmount();
		Money paidOnCredit = amount;
		Money residual = Money.pound(0);
		if (amount.getValue() > credit.getValue()) {
			residual = amount.minus(credit);
			paidOnCredit = credit;
			if (allOnCredit) {
				throw new PaymentException("Cannot pay "+amount+" with credit of "+credit+" (donation: "+donation+")");
			}
		} else {
			// pay it all
		}
		// reduce credit
		Transfer t = new Transfer(user, to, paidOnCredit);
		t.publish();
		donation.setPaymentId(t.getId());
		// OK
		return residual;
	}

	
}
