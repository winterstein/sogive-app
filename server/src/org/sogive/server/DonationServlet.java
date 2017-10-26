package org.sogive.server;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.eclipse.jetty.util.ajax.JSON;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.TermQueryBuilder;
import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;
import org.sogive.data.user.DB;
import org.sogive.server.payment.StripeAuth;
import org.sogive.server.payment.StripePlugin;

import com.stripe.exception.APIException;
import com.stripe.model.Charge;
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
 *
 */
public class DonationServlet extends CrudServlet {

	private WebRequest state;

	public DonationServlet() {
		super(Donation.class);
	}

	public void process(WebRequest state) throws IOException {
		this.state = state;
		List<AuthToken> tokens = Dep.get(YouAgainClient.class).getAuthTokens(state);
		// TODO check tokens match action
		if (state.actionIs("donate")) {
			doMakeDonation();
		} else if (state.getSlug()!=null && state.getSlug().contains("list")) {
			doList();
		} else if (state.getSlug()!=null && state.getSlug().contains("getDraft")) {
			doGetDraft();
		}
		super.process(state);
	}

	private void doList() throws IOException {
		XId user = state.getUserId();
		
		ESHttpClient es = Dep.get(ESHttpClient.class);
		SoGiveConfig config = Dep.get(SoGiveConfig.class);
		SearchRequestBuilder s = es.prepareSearch(config.getPath(null, Donation.class, null, null).index());
		if (user==null) {
			throw new WebEx.E401(null, "No user");
		} else {
			TermQueryBuilder qb = QueryBuilders.termQuery("from", user.toString());
			s.setQuery(qb);
		}
		// TODO paging!
		s.setSize(100);
		SearchResponse sr = s.get();
		List<Map> hits = sr.getHits();
		List<Map> hits2 = Containers.apply(hits, h -> (Map)h.get("_source"));
		long total = sr.getTotal();
		JsonResponse output = new JsonResponse(state, new ArrayMap(
				"hits", hits2,
				"total", total
				));
		WebUtils2.sendJson(output, state);
	}
	
	private void doGetDraft() throws IOException {
		XId user = state.getUserId();
		String to = state.get("to");
		
		ESHttpClient es = Dep.get(ESHttpClient.class);
		SoGiveConfig config = Dep.get(SoGiveConfig.class);
		SearchRequestBuilder s = es.prepareSearch(config.getPath(null, Donation.class, null, KStatus.DRAFT).index());
		
		if (user == null) {
			throw new WebEx.E401(null, "No user");
		} else if (to == null) {
			throw new WebEx.E401(null, "No target");
		} else {
			BoolQueryBuilder qb = QueryBuilders.boolQuery()
				.must(QueryBuilders.termQuery("from", user.toString()))
				.must(QueryBuilders.termQuery("to", to));
			s.setQuery(qb);
		}
		
		s.setSize(100);
		SearchResponse sr = s.get();
		List<Map> hits = sr.getHits();
		List<Map> hits2 = Containers.apply(hits, h -> (Map)h.get("_source"));
		long total = sr.getTotal();
		if (total > 0) {
			Map draft = hits2.get(0);
			WebUtils2.sendJson(new JsonResponse(state, draft), state);	
		}
		JsonResponse noResults = new JsonResponse(state);
		noResults.setSuccess(false);
		WebUtils2.sendJson(noResults, state);
	}

	private void doMakeDonation() throws IOException {
		XId user = state.getUserId();
		String email = state.get("stripeEmail");
		if (user==null && email!=null) {
			user = new XId(email, "Email");
		}			
		XId charity = new XId(state.get("charityId"), "sogive");
		String currency = state.get("currency");
		Long value100 = state.get(new LongField("value100"));
		MonetaryAmount ourFee= null;
		MonetaryAmount otherFees= null;
		boolean giftAid = state.get(new Checkbox("giftAid"));
		MonetaryAmount total= new MonetaryAmount(value100, currency);
		Donation donation = new Donation(user, charity, ourFee, otherFees, giftAid, total);
		
		// the impacts
		List impacts = (List) state.get(new JsonField("impacts"));
		if (impacts != null) {
			donation.setImpacts(impacts);
		}
		
		if (giftAid) {
			String name = state.get("name");
			String address = state.get("address");
			String postcode = state.get("postcode");
			if (name != null && address != null && postcode != null) {
				donation.setGiftAid(name, address, postcode);
			}
		}
		
		// Store in the database (acts as a form of lock)
		ESHttpClient es = Dep.get(ESHttpClient.class);
		SoGiveConfig config = Dep.get(SoGiveConfig.class);
		ESPath path = config.getPath(null, Donation.class, donation.getId(), null);
		IndexRequestBuilder pi = es.prepareIndex(path);
		pi.setRefresh("true");
		pi.setOpTypeCreate(true);		
		String json = Dep.get(Gson.class).toJson(donation);
		pi.setBodyJson(json);
		IESResponse res = pi.get().check();
		String json2 = res.getJson();
		
		// check we haven't done before: done by the op_type=create
		Person userObj = DB.getUser(user);
		String ikey = donation.getId();
		StripeAuth sa = new StripeAuth(userObj, state);
		// collect the money
		// TODO Less half-assed handling of Stripe exceptions
		try {
			Charge charge = StripePlugin.collect(donation, sa, userObj, ikey);
			Log.d("stripe", charge);
			donation.setPaymentId(charge.getId());
			donation.setCollected(true);
			
			// store in the database
			UpdateRequestBuilder pu = es.prepareUpdate(path);
			
			String json3 = Dep.get(Gson.class).toJson(donation);
			pu.setDoc(json3);
			IESResponse resAfter = pu.get().check();
			String json4 = res.getJson();		
					
			Object dobj = JSON.parse(json3);		
			JsonResponse output = new JsonResponse(state, dobj);
			WebUtils2.sendJson(output, state);
		} catch(Exception e) {
			throw new RuntimeException(e);
		}
	}

	
}
