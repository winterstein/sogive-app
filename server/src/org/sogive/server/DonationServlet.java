package org.sogive.server;

import static com.winterwell.utils.StrUtils.newLine;

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
import org.sogive.data.DBSoGive;
import org.sogive.data.charity.Money;
import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.commercial.Transfer;
import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;
import org.sogive.server.payment.MoneyCollector;
import org.sogive.server.payment.StripeAuth;
import org.sogive.server.payment.StripePlugin;

import com.goodloop.data.PaymentException;
import com.stripe.exception.APIException;
import com.stripe.model.Charge;
import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.data.PersonLite;
import com.winterwell.datalog.server.TrackingPixelServlet;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.UpdateRequestBuilder;
import com.winterwell.es.client.query.ESQueryBuilder;
import com.winterwell.es.client.query.ESQueryBuilders;
import com.winterwell.gson.FlexiGson;
import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Key;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.Utils;
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

	@Override
	protected void doSecurityCheck(WebRequest state) throws SecurityException {
		YouAgainClient ya = Dep.get(YouAgainClient.class);
		List<AuthToken> tokens = ya.getAuthTokens(state);
		// actually, it's OK to donate anonymously
	}
	
	private static final String LOGTAG = "DonationServlet";

	public DonationServlet() {
		super(Donation.class);
		defaultSort = "date-desc";
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
	protected ESQueryBuilder doList2_query(WebRequest state) {
		if ("all".equals(state.getSlugBits(2))) {
			return null; // All!
		}
		// a donations request MUST provide from or q, to avoid listing all
		String from = state.get("from");
		String q = state.get("q");
		if (from==null && q==null) {
			throw new WebEx.E40X(400, state.getRequestUrl(), "No from or q to query by");
		}
		
		ESQueryBuilder qb = null;
		// support from:user to:charity, so this can find draft donations
		if (from != null) {
			XId user = new XId(from);
			qb = ESQueryBuilders.termQuery("from", user.toString());
		}
		
		String to = state.get("to");
		if (to==null) return qb;
		
		// would ?q=to:id work just as well??
		ESQueryBuilder tq = ESQueryBuilders.termQuery("to", to);
		ESQueryBuilder qb2 = ESQueryBuilders.must(qb, tq);		
		return qb2;
	}
	
	@Override
	protected JThing doPublish(WebRequest state) {		
		Log.d(LOGTAG, "doPublish "+state);
		// make/save Donation
		super.doSave(state);
		Donation donation = (Donation) jthing.java();
		if (donation.getStatus() != KStatus.PUBLISHED) {
			doPublishFirstTime(state, donation);
		} else {
			Log.d(LOGTAG, "doPublish - but update not first time "+state);
		}
		
		// store in the database TODO use an actor which can retry
		super.doPublish(state, true, true);
				
		// Done
		return jthing;
	}

	private void doPublishFirstTime(WebRequest state, Donation donation) {
		Log.d(LOGTAG, "doPublishFirstTime "+donation+" "+state);
		// who
		XId user = state.getUserId();
		XId from = donation.getFrom(); // you can donate w/o logging in
		String email = donation.getStripe()==null? null : donation.getStripe().getEmail();
		String email2 = state.get("stripeEmail");
		String email3 = donation.getDonorEmail();
		if (user==null) {
			user = from;
		}
		if (user==null) {
			String e = Utils.or(email, email2, email3);
			if (e != null) {
				user = YouAgainClient.xidFromEmail(e);
			} else {
				String trck = TrackingPixelServlet.getCreateCookieTrackerId(state);
				if (trck!=null) { 
					user = new XId(trck);
				} else {
					user = XId.ANON;
				}
			}
		} // ./null user
		donation.setF(new XId[]{user}); // who reported this? audit trail
		// make sure from is set
		if (from==null) {			
			from = user;
			donation.setFrom(from);
			Log.d(LOGTAG, "set from to "+from+" for "+donation.getId()+" in publish "+state);
		}
		Utils.check4null(from, user);
		
		// make sure it has a date and some donor info
//		if (donation.getDate()==null) { // date = published date not draft creation date
		donation.setDate(new Time().toISOString());		
		if (donation.getDonor()==null) {
			Map info = new ArrayMap(
					"name", donation.getDonorName()
					);
			PersonLite peepLite = AppUtils.getCreatePersonLite(from, info);
			donation.setDonor(peepLite);
		}
		jthing.setJava(donation); // Is this needed to avoid any stale json?
								
		// collect the money
		if (Utils.isBlank(donation.getTo())) {
			Log.w(LOGTAG, "doPublishFirstTime null to?! "+donation+" "+state);
			String frid = donation.getFundRaiser();
			FundRaiser fr = AppUtils.get(frid, FundRaiser.class);
			assert fr != null : "doPublishFirstTime null to and no fundRaiser?! "+donation+" "+state;
			String cid = fr.getCharityId();
			if (Utils.isBlank(cid)) {
				throw new IllegalStateException("Donation fail: FundRaiser with no charity? "+fr);
			}
			donation.setTo(cid);
			Log.w(LOGTAG, "doPublishFirstTime null to - set to "+cid+" Donation: "+donation);
		}
		if (donation.isPaidElsewhere()) {
			Log.d(LOGTAG, "paid elsewhere "+donation);
		} else {			
			XId to = NGO.xidFromId(donation.getTo());
			MoneyCollector mc = new MoneyCollector(donation, user, to, state);
			mc.run();
		}
		
		// Donating to/via a fundraiser? Update its donation total + add matched funding
		String frid = donation.getFundRaiser();
		if ( ! Utils.isBlank(frid)) {
//			FundraiserServlet fart = new FundraiserServlet();
			DonateToFundRaiserActor dtfa = Dep.get(DonateToFundRaiserActor.class);
			dtfa.send(donation);
			Log.d(LOGTAG, "send to DonateToFundRaiserActor "+donation);
		} else {
			Log.d(LOGTAG, "no fundraiser for "+donation+" so dont call DonateToFundRaiserActor");
		}
	}

	
}
