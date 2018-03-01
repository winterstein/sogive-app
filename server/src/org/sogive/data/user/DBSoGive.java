package org.sogive.data.user;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;

import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.Operator;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.commercial.Basket;
import org.sogive.data.commercial.Event;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.commercial.Ticket;
import org.sogive.data.commercial.Transfer;
import org.sogive.data.loader.ImportOSCRData;

import com.winterwell.utils.io.SqlUtils;
import com.goodloop.data.Money;
import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.data.PersonLite;
import com.winterwell.es.ESPath;
import com.winterwell.es.ESType;
import com.winterwell.es.IESRouter;
import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.admin.CreateIndexRequest;
import com.winterwell.es.client.admin.CreateIndexRequest.Analyzer;
import com.winterwell.gson.Gson;
import com.winterwell.es.client.admin.PutMappingRequestBuilder;
import com.winterwell.utils.Dep;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.io.ArgsParser;
import com.winterwell.utils.log.Log;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.data.XId;

/**
 * What do we store in SQL? Low latency stuff.
 * 
 *  - Transactions
 *  - Is that it?
 *  
 * @author daniel
 *
 */
public class DBSoGive {

	private static final Class[] DBCLASSES = new Class[] {
			NGO.class, 
			Person.class, Team.class, Event.class, 
			FundRaiser.class,
			Basket.class, Donation.class, Ticket.class,
			Transfer.class
			};

	public static void init() {
		assert(Dep.has(Gson.class));
		ESHttpClient es = Dep.get(ESHttpClient.class);
		SoGiveConfig config = Dep.get(SoGiveConfig.class);

		AppUtils.initESIndices(KStatus.main(), DBCLASSES);
		
		// charity mapping
		
		// dates also have a "raw" string field, for storing badly formatted input
		// This is handled in Project.init()
		ESType raw = new ESType().text().noIndex().noAnalyzer();
		ESType money = Money.ESTYPE;
		
		ESType charitymapping = new ESType()
				.property("projects", 
						new ESType().object()
							.property("year", new ESType().INTEGER())
							.property("start", new ESType().date())
							.property("start_raw", raw)
							.property("end", new ESType().date())
							.property("end_raw", raw)
//							.property("inputs", money) TODO => reindex
							.property("outputs", 
									new ESType().object()
//									.property("costPerOutput", money) TODO => reindex
									)
						) // ./projects				
				.property("suggest", new ESType().completion());	

		// mappings
		AppUtils.initESMappings(KStatus.main(), 
				// default handling for Basket Ticket etc.
				DBCLASSES,
				new ArrayMap(
					
					NGO.class, charitymapping,
						
					Donation.class,
						new ESType()
							.property("from", ESType.keyword)
							.property("to", ESType.keyword)
							.property("date", new ESType().date()),
					
					Transfer.class,
							new ESType()
								.property("from", ESType.keyword)
								.property("to", ESType.keyword)
								.property("date", new ESType().date()),
					
					Ticket.class, 
							new ESType()
								.property("eventId", ESType.keyword)
					
				));
		
		// Dummy TBD charity
		NGO ngo = new NGO("tbd");
		ngo.put("displayName", "TBD: To Be Decided");
		ngo.put("description", "This is a placeholder for people who haven't picked their charity yet.");
		ESPath draftPath = Dep.get(IESRouter.class).getPath(NGO.class, "tbd", KStatus.DRAFT);
		ESPath pubPath = Dep.get(IESRouter.class).getPath(NGO.class, "tbd", KStatus.PUBLISHED);
		AppUtils.doPublish(new JThing(ngo), draftPath, pubPath);
	}

	public static List<NGO> getCharityById(NGO ngo) {
		ESConfig ec = Dep.get(ESConfig.class);
		ESHttpClient esjc = new ESHttpClient(ec);
		SearchRequestBuilder search = esjc.prepareSearch("charity");
		BoolQueryBuilder qb = QueryBuilders.boolQuery();
		for (String f : new String[] {
				NGO.ID, "englandWalesCharityRegNum", ImportOSCRData.OSCR_REG,
				"niCharityRegNum",
				"ukCompanyRegNum", "usCompanyRegNum"
		}) {
			if (ngo.get(f) != null) {
				qb.should(QueryBuilders.termQuery(f, ngo.get(f)));
			}
		}
		qb.minimumNumberShouldMatch(1);
		search.setQuery(qb);
		List<NGO> hits = search.get().getSearchResults(NGO.class);		
		return hits;
	}

	public static Person getCreateUser(XId user) {
		ESPath path = Dep.get(IESRouter.class).getPath(Person.class, user.toString(), KStatus.PUBLISHED);
		Person peep = AppUtils.get(path, Person.class);
		if (peep != null) return peep;
		PersonLite peepLite = AppUtils.getCreatePersonLite(user, null);
		// HACK copy over
		peep = new Person(peepLite);
		peep.isFresh = true; // HACK 
		return peep;
	}

}
