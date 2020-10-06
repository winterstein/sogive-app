package org.sogive.server;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;

import org.sogive.data.charity.NGO;
import org.sogive.data.commercial.Event;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.user.Donation;
import org.sogive.data.user.RepeatDonation;
import org.sogive.server.payment.IForSale;
import org.sogive.server.payment.MoneyCollector;

import com.winterwell.data.KStatus;
import com.winterwell.data.PersonLite;
import com.winterwell.datalog.server.TrackingPixelServlet;
import com.winterwell.es.ESPath;
import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.KRefresh;
import com.winterwell.es.client.query.ESQueryBuilder;
import com.winterwell.es.client.query.ESQueryBuilders;
import com.winterwell.ical.ICalEvent;
import com.winterwell.ical.Repeat;
import com.winterwell.utils.Dep;
import com.winterwell.utils.ReflectionUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.threads.MsgToActor;
import com.winterwell.utils.time.Period;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.Emailer;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;
import com.winterwell.web.email.SimpleMessage;
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
public class DonationServlet extends CrudServlet<Donation> {

	@Override
	protected String doAction2_blockRepeats2_actionId(WebRequest state) {
		// This is stronger than base behaviour.
		// Block eg the 2x Stripe customers bug seen Feb 2020 in SoGive
		// by relying on the url to be RESTful and hence specific enough
		return state.getAction()+" "+state.getRequestUrl();
	}
	
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
	protected ESQueryBuilder doList3_ESquery(String q, String prefix, Period period, WebRequest stateOrNull) {
		// HACK - include personal data for admin requests
		if (q != null && q.endsWith("purpose:admin")) {
			q = q.substring(0, q.length()-"purpose:admin".length()).trim();
			Log.d(LOGTAG, "doList3_ESquery hack: chop purpose so q="+q);
		}
		
		return super.doList3_ESquery(q, prefix, period, stateOrNull);
	}

	@Override
	protected ESQueryBuilder doList4_ESquery_custom(WebRequest state) {
		// a donations request MUST provide from or q, to avoid listing all
		String from = state.get("from");
		String q = state.get(SearchServlet.Q); // NB: q is NOT processed in this method - just sanity checked - see super.doList()

		// HACK
		if (q !=null && q.endsWith("purpose:admin")) {
			Log.d(LOGTAG, "doList4_ESquery_custom hack: chop purpose so q="+q);
			q = q.substring(0, q.length() - "purpose:admin".length()).trim();
		}

		if (ALL.equalsIgnoreCase(q)) {
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
	protected JThing doPublish(WebRequest state, KRefresh forceRefreshIgnoredToTrue, boolean deleteDraftIgnoredToTrue) {
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
		List<MsgToActor> msgs = null;
		if (KStatus.wasPublished(donation.getStatus())) {
			Log.d(LOGTAG, "doPublish - but update only, as not first time "+state);			
		} else {
			// Collect money etc
			msgs = doPublishFirstTime(state, donation);
		}
		// repeat?
		setupRepeat(donation);
		
		// store in the database TODO use an actor which can retry
		// NB: done after the mods that may be made by doPublishFirstTime
		super.doPublish(state, KRefresh.TRUE, true);
		
		// Update fundraiser (done after the publish)
		MsgToActor.postAll(msgs);
		
		// Done
		return jthing;
	}
	

	
	/**
	 * Remove sensitive details for privacy
	 * TODO Export-CSV should e.g. set a prop on the servlet which says "don't sanitize, I need full data"
	 * @param hits2
	 * @param state
	 * @return
	 */
	@Override
	protected void cleanse(JThing<Donation> thing, WebRequest state) {
		// TODO HACK if returning a list for the event owner - show more info
		boolean showEmailAndAddress = false;
		// ...HACK is this for manageDonations?
		String q = state.get(SearchServlet.Q);
		String ref = state.getReferer();
		if (q !=null && q.endsWith("purpose:admin")) {
			// TODO Is this an admin eg Sanjay
			YouAgainClient ya = Dep.get(YouAgainClient.class);
			List<AuthToken> tokens = ya.getAuthTokens(state);
			// TODO get admins from YA
			for (AuthToken authToken : tokens) {
				if ( ! authToken.xid.isService("email")) continue;
				String n = authToken.xid.getName();
				if (n.endsWith("good-loop.com")) showEmailAndAddress = true;
				if (n.equals("sanjay@sogive.org")) showEmailAndAddress = true;
				if (n.equals("candice.spendelow@gmail.com")) showEmailAndAddress = true;				
			}
			// SAFETY HACK
			if ( ! showEmailAndAddress) throw new WebEx.E403("Only admins can use this page for now. No admin user listed in auth-tokens: "+tokens);
			Log.d(LOGTAG, "hack purpose:admin upgrade data for "+tokens);
		}
		
		Donation donation = thing.java();

		// We want to be able to display a name unless the donor requested anonymity
		// So grab (or scrape a proxy name from email if necessary) before we scrub other PII
		String donorName = null;
		Boolean anonymous = donation.getAnonymous();
		if (anonymous == null) anonymous = false;
		if (showEmailAndAddress) anonymous = false;
		if ( ! anonymous) {
			// Try to get an explicitly declared name
			donorName = donation.getDonorName();
			PersonLite donor = donation.getDonor();
			if (donorName == null && donor!=null) donorName = donor.getName();
			
			// Still no name? Fall back to email addresses, but just take everything up to the @ for privacy
			// This mimics the name-reconstructing behaviour used on the front end
			if (donorName == null) {
				String donorEmail = donation.getDonorEmail();
				if (donorEmail == null && donor != null) donorEmail = donor.id;
				if (donorEmail == null) donorEmail = donation.getFrom().name;
				// We've done all we can! Strip everything after the @ and go.
				if (donorEmail != null) donorName = donorEmail.replaceAll("@.*", "");
			}
		}
		
		// We've got a name or proxy, now scrub all possibly-sensitive fields
		if ( ! showEmailAndAddress) {
			donation.setFrom(null);
			donation.setDonor(null);
			donation.setDonorName(null);
			donation.setDonorEmail(null);
			donation.setDonorAddress(null);
			donation.setDonorPostcode(null);
			donation.setVia(null); // The fundraiser owner's email also probably counts as PII, even though it's likely available elsewhere
			donation.setF(null);			
			// Don't scrub the tip - we may need to show this to the user			
//			donation.setTip(null);
		}
		// always null out background financial info
		donation.setPaymentId(null);
		donation.setStripe(null);						
		
		// Now reinstate the "donor" object but with only a name
		if ( ! anonymous && ! Utils.isBlank(donorName)) {
			// Fake an XID for the PersonLite object
			PersonLite donor = new PersonLite(new XId(donorName, "name", false));
			donor.setName(donorName);
			donation.setDonor(donor);
		}
		
		// done
		thing.setJava(donation);
	}
	

	private void setupRepeat(Donation donation) {
		ESPath path = AppUtils.getPath(null, RepeatDonation.class, RepeatDonation.idForDonation(donation), KStatus.PUBLISHED);
//		RepeatDonation rep = AppUtils.get(path, RepeatDonation.class);
		Repeat repeater = donation.getRepeat();
		if (repeater==null) {
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

	private List<MsgToActor> doPublishFirstTime(WebRequest state, Donation donation) {
		Log.d(LOGTAG, "doPublishFirstTime "+donation+" "+state);
		// who
		XId user = state.getUserId();
		XId from = donation.getFrom(); // you can donate w/o logging in
		String email = getEmail(state, donation);
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
		
		// make sure `from` is set
		if (from==null) {			
			from = user;
			if (from==null) from = new XId(email, "email");
			donation.setFrom(from);
			Log.d(LOGTAG, "set from to "+from+" for "+donation.getId()+" in publish "+state);
		}

		if (user!=null && from!=null && ! user.equals(from)) {
			Log.e(LOGTAG, "from/user mismatch from:"+from+" user:"+user+" donation:"+donation);
		}
		
		// do it!
		List<MsgToActor> msgs = doPublish3_ShowMeTheMoney(state, donation, from, email);		
		
		jthing.setJava(donation); // Is this needed to avoid any stale json?
		return msgs;
	}

	static String getEmail(WebRequest state, IForSale donation) {
		// get an email from somewhere
		String email1 = donation.getStripe()==null? null : donation.getStripe().getEmail();
		String email2 = state.get("stripeEmail");
		String email3 = donation instanceof Donation? ((Donation) donation).getDonorEmail() : null;
		XId user = state.getUserId();		
		String email4 = user != null && user.isService("email")? user.getName() : null;
		XId from = donation instanceof Donation? ((Donation) donation).getFrom() : null;
		String email5 = from != null && from.isService("email")? from.getName() : null;		
		// stripe, donor form, user, login
		String email = Utils.or(email1, email2, email3, email4, email5); // can still be null
		return email;
	}

	/**
	 * Collect money!
	 * One off or repeat donations are OK
	 * @param state Can be null
	 * @param donation
	 * @param user Cannot be null (use email if not logged in)
	 * @param email Can be null for e.g. Good-Loop "donations" But must be set for "proper" SoGive donations 
	 * @return unposted message, to allow it to be posted after the donation is published
	 */
	public static List<MsgToActor> doPublish3_ShowMeTheMoney(WebRequest state, Donation donation, XId user, String email) 
	
	{
		Utils.check4null(donation, user);
		// guard against repeat bug seen Feb 2020
		if (donation.isCollected() && ! donation.isPaidElsewhere()) {
			Log.e(LOGTAG, "skip doPublish3_ShowMeTheMoney - duplicate? "+donation.getId()+" "+state);
			return new ArrayList();
		}
			
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
				// recover from the event?
				Event event = fr.getEvent();
				if (event!=null) {
					cid = event.getCharityId();
				}
				if (cid==null) {
					throw new IllegalStateException("Donation fail: FundRaiser with no charity? "+fr);
				}
				Log.w(LOGTAG, "fundraiser "+frid+" without a charity? recovered cid="+cid+" from event");
			}
			donation.setTo(cid);
			Log.w(LOGTAG, "doPublishFirstTime null to - set to "+cid+" Donation: "+donation);
		}
		if (donation.isPaidElsewhere()) {
			Log.d(LOGTAG, "paid elsewhere "+donation);
		} else {					
			Utils.check4null(donation, email);
			String _to = donation.getTo();
			assert _to != null : "No charity ID?! "+donation;
			XId to = NGO.xidFromId(_to);
			MoneyCollector mc = new MoneyCollector(donation, user, email, to, state);
			mc.run(); // what if this fails??
		}
		
		// Donating to/via a fundraiser? Update its donation total + add matched funding
		
		String frid = donation.getFundRaiser();
		List<MsgToActor> msgs = new ArrayList();
		if ( ! Utils.isBlank(frid)) {
			DonateToFundRaiserActor dtfa = Dep.get(DonateToFundRaiserActor.class);
			MsgToActor msg = new MsgToActor<>(dtfa, donation, null);
			msgs.add(msg);
			Log.d(LOGTAG, "send to DonateToFundRaiserActor "+donation);
		} else {
			Log.d(LOGTAG, "no fundraiser for "+donation+" so dont call DonateToFundRaiserActor");
		}
		
		// Send an email receipt
		if (email != null) {
			try {
				doUploadTransfers2_email(donation, email);
			} catch(Throwable ex) {
				Log.e(LOGTAG+".swallow", ex);
				// don't choke though, carry on
			}
		}
		return msgs;
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
		if (Utils.yes(donation.getHasTip()) && donation.getTip()!=null && ! donation.getTip().isZero()) {
			tip = " (including a tip of "+donation.getTip()+" to cover SoGive's costs)";
		}
		String cid = donation.getTo();
		NGO charity = AppUtils.get(cid, NGO.class);
		
		String beneficiary = charity!=null? Utils.or(charity.getDisplayName(), charity.getName(), charity.getId())
				: donation.getFundRaiser(); // paranoia / testing
		
		String bodyHtml = "<div><h2>Thank You for Donating!</h2><p>We've received your donation of "
				+amount
				+" to "+beneficiary
				+tip
				+".</p><p>Payment ID: "+Utils.or(donation.getPaymentId(),donation.getPaymentMethod(),donation.getId())
				+"<br>Donation ID: "+donation.getId()+"</p></div>";
		String bodyPlain = WebUtils2.getPlainText(bodyHtml);
		email.setHtmlContent(bodyHtml, bodyPlain);
		emailer.send(email);
	}
}
