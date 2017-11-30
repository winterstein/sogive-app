package org.sogive.server;

import java.io.File;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.TermQueryBuilder;
import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.commercial.Transfer;

import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.utils.Dep;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.Utils;
import com.winterwell.utils.io.CSVReader;
import com.winterwell.utils.io.CSVSpec;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;
import com.winterwell.web.fields.SField;
import com.winterwell.youagain.client.AuthToken;
import com.winterwell.youagain.client.YouAgainClient;

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
		
		String csv = state.get(new SField("csv"));
		StringReader input = new StringReader(csv.trim());
		CSVSpec spec = new CSVSpec();
		CSVReader r = new CSVReader(input, spec);
		YouAgainClient yac = Dep.get(YouAgainClient.class);
		List<AuthToken> authd = yac.getAuthTokens(state);
		XId from = state.getUserId();	
		assert from != null : state;
		List<Transfer> transfers = new ArrayList();
		for (String[] row : r) {		
			if (row[0].equalsIgnoreCase("email")) continue;
			XId to = YouAgainClient.xidFromEmail(row[0]);
			MonetaryAmount amount = MonetaryAmount.pound(Double.valueOf(row[1]));
			// how shall we store credits
			// ??separate objects?? ??as a field on the user??
			Transfer t = new Transfer(from, to, amount);
			transfers.add(t);
		}
		// NB: any fail above will abort the whole upload, which is prob good
		for(Transfer t : transfers) {
			JThing draft = new JThing(t);
			ESPath draftPath = Dep.get(IESRouter.class).getPath(Transfer.class, t.id, KStatus.DRAFT);
			ESPath publishPath = Dep.get(IESRouter.class).getPath(Transfer.class, t.id, KStatus.PUBLISHED);
			JThing after = AppUtils.doPublish(draft, draftPath, publishPath);
		}
		List cargo = transfers;
		JsonResponse output = new JsonResponse(state, cargo);
		WebUtils2.sendJson(output, state);
	}

}
