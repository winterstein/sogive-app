package org.sogive.server;

import static com.winterwell.utils.StrUtils.newLine;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;

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
import org.sogive.data.user.RepeatDonation;
import org.sogive.server.payment.MoneyCollector;
import org.sogive.server.payment.StripeAuth;
import org.sogive.server.payment.StripePlugin;

import com.goodloop.data.PaymentException;
import com.stripe.exception.APIException;
import com.stripe.model.Charge;
import com.winterwell.web.ajax.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.data.PersonLite;
import com.winterwell.datalog.server.TrackingPixelServlet;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.es.client.ESConfig;
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
import com.winterwell.ical.ICalEvent;
import com.winterwell.ical.Repeat;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Key;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.threads.ICallable;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.CommonFields;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.Emailer;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;
import com.winterwell.web.email.SimpleMessage;
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
		// a donations request MUST provide from or q, to avoid listing all
		String from = state.get("from");
		String q = state.get("q"); // NB: q is NOT processed in this method - just sanity checked - see super.doList()
		if ("ALL".equals(q)) {
			return null; // All! 
		}
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
	protected JThing doPublish(WebRequest state, boolean forceRefreshIgnoredToTrue, boolean deleteDraftIgnoredToTrue) {
		Log.d(LOGTAG, "doPublish "+state);
		// make/save Donation
		super.doSave(state);
		Donation donation = (Donation) jthing.java();
		// donations must be positive
		if (donation.getAmount().getValue100p() <= 0) {
			throw new WebEx.E400(
				"Donations must be for a positive amount: "+donation.getAmount()+" (donation id: "+donation.getId()
			);
		}
		if (donation.getStatus() != KStatus.PUBLISHED) {
			doPublishFirstTime(state, donation);
		} else {
			Log.d(LOGTAG, "doPublish - but update not first time "+state);
		}
		// repeat?
		setupRepeat(donation);
		
		// store in the database TODO use an actor which can retry
		super.doPublish(state, true, true);
				
		// Done
		return jthing;
	}

	private void setupRepeat(Donation donation) {
		ESPath path = AppUtils.getPath(null, RepeatDonation.class, RepeatDonation.idForDonation(donation), KStatus.PUBLISHED);
//		RepeatDonation rep = AppUtils.get(path, RepeatDonation.class);
		String repeat = donation.getRepeat();
		if ( ! Utils.yes(repeat, false) || "one-off".equals(repeat)) { // NB: "one-off" should not be sent, but harmless to test for it
			AppUtils.doDelete(path);
			return;
		}
		
		// Make it
		RepeatDonation rep = new RepeatDonation(donation);				
		// debug
		List<ICalEvent> reps = rep.ical.getRepeats(new Time(), new Time().plus(TUnit.YEAR));
		// publish
//		AppUtils.doPublish(rep, false, true);		
		ESHttpClient esjc = new ESHttpClient(Dep.get(ESConfig.class));
		IndexRequestBuilder index = esjc.prepareIndex(path);
		index.setBodyDoc(rep);
		index.execute();
	}

	private void doPublishFirstTime(WebRequest state, Donation donation) {
		Log.d(LOGTAG, "doPublishFirstTime "+donation+" "+state);
		// who
		XId user = state.getUserId();
		XId from = donation.getFrom(); // you can donate w/o logging in
		// get an email from somewhere
		String email1 = donation.getStripe()==null? null : donation.getStripe().getEmail();
		String email2 = state.get("stripeEmail");
		String email3 = donation.getDonorEmail();
		String email4 = user != null && user.isService("email")? user.getName() : null;
		String email5 = from != null && from.isService("email")? from.getName() : null;		
		String email = Utils.or(email1, email2, email3, email4, email5); // can still be null
		// make sure we have a user
		if (user==null) {
			user = from;
		}
		if (user==null) {			
			if (email != null) {
				user = YouAgainClient.xidFromEmail(email);
			} else {
				String trck = TrackingPixelServlet.getCreateCookieTrackerId(state);
				if (trck!=null) { 
					user = new XId(trck);
				} else {
					user = XId.ANON;
				}
			}
		} // ./null user

		// make sure from is set
		if (from==null) {			
			from = user;
			donation.setFrom(from);
			Log.d(LOGTAG, "set from to "+from+" for "+donation.getId()+" in publish "+state);
		}

		if (user!=null && from!=null && ! user.equals(from)) {
			Log.e(LOGTAG, "from/user mismatch from:"+from+" user:"+user+" donation:"+donation);
		}
		
		// do it!
		doPublish3_ShowMeTheMoney(state, donation, from, Utils.or(email3, email));
		
		jthing.setJava(donation); // Is this needed to avoid any stale json?
	}

	/**
	 * 
	 * @param state Can be null
	 * @param donation
	 * @param user
	 * @param email
	 */
	public static void doPublish3_ShowMeTheMoney(WebRequest state, Donation donation, XId user, String email) {
		Utils.check4null(donation, user, email);
		donation.setF(new XId[]{user}); // who reported this? audit trail
		
		// make sure it has a date and some donor info
//		if (donation.getDate()==null) { // date = published date not draft creation date
		donation.setDate(new Time().toISOString());		
		if (donation.getDonor()==null) {
			Map info = new ArrayMap(
					"name", donation.getDonorName()
					);
			PersonLite peepLite = AppUtils.getCreatePersonLite(user, info);
			donation.setDonor(peepLite);
		}
								
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
		
		// Send an email
		try {
			doUploadTransfers2_email(donation, email);
		} catch(Throwable ex) {
			Log.e(LOGTAG, ex);
			// don't choke though, carry on
		}
	}

	/**
	 * copy pasta code TODO refactor
	 * @param email 
	 * @param transfers
	 * @throws AddressException 
	 */
	static void doUploadTransfers2_email(Donation donation, String emailAddress) throws AddressException {
		if (emailAddress==null) {
			Log.d(LOGTAG, "no email for recipt "+donation);
			return;
		}
		Emailer emailer = Dep.get(Emailer.class);
		
		SimpleMessage email = new SimpleMessage(emailer.getBotEmail());			
		XId txid = YouAgainClient.xidFromEmail(emailAddress);			
		InternetAddress to = new InternetAddress(txid.getName());
		email.addTo(to);
		email.setSubject("Thank you for donating :)");
		String amount = donation.getAmount().toString();
		String tip = "";
		if (Utils.yes(donation.getHasTip())) {
			tip = " (including a tip of "+donation.getTip()+" to cover SoGive's costs)";
		}
		String cid = donation.getTo();
		NGO charity = AppUtils.get(cid, NGO.class);
		
		String bodyHtml = "<div><h2>Thank You for Donating!</h2><p>We've received your donation of "
				+amount
				+" to "+Utils.or(charity.getDisplayName(), charity.getName(), charity.getId())
				+tip
				+".</p><p>Payment ID: "+Utils.or(donation.getPaymentId(),donation.getPaymentMethod(),donation.getId())
				+"<br>Donation ID: "+donation.getId()+"</p></div>";
		String bodyPlain = WebUtils2.getPlainText(bodyHtml);
		email.setHtmlContent(bodyHtml, bodyPlain);
		emailer.send(email);
	}
	
}
