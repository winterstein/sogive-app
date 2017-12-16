package org.sogive.server;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;

import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.TermQueryBuilder;
import org.sogive.data.charity.Money;
import org.sogive.data.commercial.Transfer;
import org.sogive.data.user.DBSoGive;
import org.sogive.data.user.Person;

import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.utils.Dep;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.Utils;
import com.winterwell.utils.io.CSVReader;
import com.winterwell.utils.io.CSVSpec;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.Emailer;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;
import com.winterwell.web.email.SimpleMessage;
import com.winterwell.web.fields.SField;
import com.winterwell.youagain.client.AuthToken;
import com.winterwell.youagain.client.YouAgainClient;
import com.winterwell.youagain.plugins.EmailPlugin;

/**
 * Status: hack
 * 
 * Allow companies to provide credit to individuals. e.g. SoGive to its backers
 * 
 * @author daniel
 *
 */
public class CreditServlet extends CrudServlet<Transfer> implements IServlet {

	public CreditServlet() {
		super(Transfer.class);
	}
	

	@Override
	protected QueryBuilder doList2_query(WebRequest state) {
		// support from:user
		String from = state.get("from");
		if (from!=null) {
			TermQueryBuilder qb = QueryBuilders.termQuery("from", from);
			return qb;
		}
		String to = state.get("to");
		if (to!=null) {
			TermQueryBuilder qb = QueryBuilders.termQuery("to", to);
			return qb;
		}
		String toFrom = state.get("toFrom");
		if (toFrom!=null) {
			QueryBuilder qb = QueryBuilders.boolQuery()
					.should(QueryBuilders.termQuery("to", toFrom))
					.should(QueryBuilders.termQuery("from", toFrom))
					.minimumNumberShouldMatch(1)
					;
			return qb;
		}
		return null;
	}

	@Override
	public void process(WebRequest state) throws Exception {
		if (state.getSlug().contains("/list")) {
			doList(state);
			return;
		}
		
		// upload new transfers
		doUploadTransfers(state);
	}


	private void doUploadTransfers(WebRequest state) throws IOException {
		String csv = state.get(new SField("csv"));
		StringReader input = new StringReader(csv.trim());
		CSVSpec spec = new CSVSpec();
		CSVReader r = new CSVReader(input, spec);
		YouAgainClient yac = Dep.get(YouAgainClient.class);
		List<AuthToken> authd = yac.getAuthTokens(state);
		XId from = state.getUserId();	
		assert from != null : state;
		List<Transfer> transfers = new ArrayList();
		// TODO use an Actor for volume
		for (String[] row : r) {		
			if (row[0].equalsIgnoreCase("email")) continue;
			XId to = YouAgainClient.xidFromEmail(row[0]);
			
			// make sure they have an account
			Person user = DBSoGive.getCreateUser(to);
			// FIXME is this a new user? If so we should reflect that in the welcome message
			// How to test? ideally check login history. for now hack
			
			Money amount = Money.pound(Double.valueOf(row[1]));
			// how shall we store credits
			// ??separate objects?? ??as a field on the user??
			Transfer t = new Transfer(from, to, amount);
			t.toPerson = user;
			transfers.add(t);
		}
		// NB: any fail above will abort the whole upload, which is prob good
		for(Transfer t : transfers) {
			t.publish();
		}
		// tell people
		try {
			doUploadTransfers2_email(transfers);
		} catch(Throwable ex) {
			Log.e(ex);
		}
		List cargo = transfers;
		JsonResponse output = new JsonResponse(state, cargo);
		WebUtils2.sendJson(output, state);
	}


	// TODO test this
	void doUploadTransfers2_email(List<Transfer> transfers) {
		Emailer emailer = Dep.get(Emailer.class);
		Throwable err = null;
		for(Transfer t : transfers) {
			try {
				SimpleMessage email = new SimpleMessage(emailer.getBotEmail());
				XId txid = t.getTo();			
				InternetAddress to = new InternetAddress(txid.getName());
				email.addTo(to);
				email.setSubject("You have received credit to donate :)");
				String nu = "";
				if (t.toPerson!=null && t.toPerson.isFresh) {
					// TODO create a password-reset link with YA so they can click through to claim it.
					nu = "Welcome to Soive - we have setup a blank account to hold your credit.";
				}
				String bodyHtml = "<div><h2>Hooray!</h2><p>"+nu+"</p><p>Your credit is: "+t.toString()+"</p></div>"; // FIXME
				String bodyPlain = WebUtils2.getPlainText(bodyHtml);
				email.setHtmlContent(bodyHtml, bodyPlain);
				emailer.send(email);
			} catch(Throwable ex) {
				err = ex;
				Log.e(ex);
			}
		}
		if (err!=null) throw Utils.runtime(err);
	}


}
