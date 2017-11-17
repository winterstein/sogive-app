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
import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;
import org.sogive.data.user.DBSoGive;
import org.sogive.server.payment.StripeAuth;
import org.sogive.server.payment.StripePlugin;

import com.stripe.exception.APIException;
import com.stripe.model.Charge;
import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
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
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.ajax.JsonResponse;
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

	public DonationServlet() {
		super(Donation.class);
	}

	public void process(WebRequest state) throws Exception {
		// crud + list
		super.process(state);
	}
	
	@Override
	protected void doList(WebRequest state) throws IOException {
		super.doList(state);
	}
		
	@Override
	protected QueryBuilder doList2_query(WebRequest state) {
		// support from:user to:charity, so this can find draft donations
		XId user = state.getUserId();
		if (user==null) return null;
		TermQueryBuilder qb = QueryBuilders.termQuery("from", user.toString());
		
		String to = state.get("to");
		if (to==null) return qb;
		
		// would ?q=to:id work just as well??
		QueryBuilder tq = QueryBuilders.termQuery("to", user.toString());;
		
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
		
		// Donating to/via a fundraiser? Update its donation total.
		String frid = donation.getFundRaiser();
		if (frid != null && !frid.isEmpty()) {
			ESPath frPath = new ESPath(frid, frid, frid);
			FundraiserServlet fart = new FundraiserServlet();
			DonateToFundRaiserActor dtfa = Dep.get(DonateToFundRaiserActor.class);
			dtfa.send(donation);
		}
		
		// take payment
		String ikey = donation.getId();
		Person userObj = DBSoGive.getCreateUser(user);
		
		/** Donation has provision to store a StripeAuth now - may already be on the object */
		StripeAuth sa = donation.getStripe();
		if (sa == null) {
			sa = new StripeAuth(userObj, state);
		}
		
		// collect the money
		// TODO Less half-assed handling of Stripe exceptions
		try {
			Charge charge = StripePlugin.collect(donation.getTotal(), donation.getId(), sa, userObj, ikey);
			Log.d("stripe", charge);
			donation.setPaymentId(charge.getId());
			donation.setCollected(true);
			
			// store in the database
			super.doPublish(state);
			// FIXME
//			pi.setRefresh("true");
//			pi.setOpTypeCreate(true);				
			// check we haven't done before: done by the op_type=create
			return jthing;
		} catch(Exception e) {
			throw new RuntimeException(e);
		}
	}

	
}
