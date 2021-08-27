package org.sogive.data.loader;

import java.util.List;
import java.util.Map;

import org.sogive.data.DBSoGive;
import org.sogive.data.charity.NGO;

import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.SearchRequest;
import com.winterwell.es.client.query.ESQueryBuilder;
import com.winterwell.es.client.query.ESQueryBuilders;
import com.winterwell.gson.Gson;
import com.winterwell.maths.stats.distributions.discrete.ObjectDistribution;
import com.winterwell.utils.Dep;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;

public class CharityMatcher {

	public ObjectDistribution<NGO> match(NGO ngo) {
		ObjectDistribution<NGO> od = new ObjectDistribution<>();
		// TODO search the DB by name, ID
		// by ID?
		List<NGO> charity = DBSoGive.getCharityById(ngo);
		if (charity != null && !charity.isEmpty()) {
			od.train(charity);
			return od;
		}

		ESConfig ec = Dep.get(ESConfig.class);
		ESHttpClient esjc = new ESHttpClient(ec);
		SearchRequest search = esjc.prepareSearch("charity");
		String q = Utils.or(ngo.get("displayName"), ngo.getName()).toString();
		q = StrUtils.toCanonical(q);
		// this will query _all
		ESQueryBuilder qb = ESQueryBuilders.simpleQueryStringQuery(q)
//							.defaultOperator(Operator.AND)
		;
		search.setQuery(qb);
		List<Map> hits = search.get().getHits();
		Gson gson = Dep.get(Gson.class);
		for (Map hit : hits) {
			NGO ngoHit = gson.fromJson(gson.toJson(hit), NGO.class);
			od.count(ngoHit);
		}
		return od;
	}

}
