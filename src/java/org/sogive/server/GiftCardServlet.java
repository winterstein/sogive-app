package org.sogive.server;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.sogive.data.DBSoGive;
import org.sogive.data.commercial.Ticket;
import org.sogive.data.commercial.Transfer;
import org.sogive.data.user.GiftCard;
import org.sogive.data.user.Person;

import com.goodloop.data.Money;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.query.ESQueryBuilder;
import com.winterwell.es.client.query.ESQueryBuilders;
import com.winterwell.utils.Dep;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.FakeBrowser;
import com.winterwell.web.WebEx;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.ajax.JsonResponse;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;
import com.winterwell.youagain.client.AuthToken;
import com.winterwell.youagain.client.YouAgainClient;

public class GiftCardServlet extends CrudServlet<GiftCard> {
	
	public GiftCardServlet() {
		super(GiftCard.class);
	}
	
	@Override
	public void process(WebRequest state) throws Exception {
		if (state.getSlug().contains("/generate")) {
			generateGiftCard(state);
		} else if (state.getSlug().contains("/redeem")) {
			redeemGiftCard(state);
		}
	}
	
	public void generateGiftCard(WebRequest state) throws IOException {
		// Check credentials
		YouAgainClient yac = Dep.get(YouAgainClient.class);
		// This is, in a round-about way, responsible for setting state's uxid
		List<AuthToken> authd = yac.getAuthTokens(state);
		
		// Who is authorising this gift-card?
		XId generatedBy = state.getUserId();
		if( generatedBy == null ) throw new WebEx.E50X(500, "", "GiftCards can only be generated by authorised users");
		
		// How much is the new card worth?
		String rawAmount = state.get("amount");
		if( rawAmount == null ) throw new WebEx.E50X(500, "", "amount parameter must be present in body when generating a new gift card");
		Double amount = Double.parseDouble(state.get("amount"));
		
		GiftCard giftCard = new GiftCard(amount, generatedBy.name);
					
		// Retain unhashed value to post back to front-end
		String code = giftCard.code;
		
		// Hash and store in DB
		String hashedCode = StrUtils.sha1(code);
		giftCard.code = hashedCode;

		storeGiftCardInDB(giftCard);
		
		// Return card details
		Map<String, String> res = new ArrayMap();
		res.put("code", code);
		res.put("value", giftCard.amount.getValue().toString());
		
		JsonResponse output = new JsonResponse(state, res);
		WebUtils2.sendJson(output, state);
	}
	
	public void storeGiftCardInDB(GiftCard card) {
		String code = card.code;
		
		ESPath draftPath = esRouter.getPath(dataspace, GiftCard.class, code, KStatus.DRAFT);
		ESPath publishPath = esRouter.getPath(dataspace, GiftCard.class, code, KStatus.PUBLISHED);
		JThing jgiftCard = new JThing().setJava(card);
		JThing obj = AppUtils.doPublish(jgiftCard, draftPath, publishPath);	
	}
	
	public void redeemGiftCard(WebRequest state) {
		String code = state.get("code");
		
		String creditTarget = state.get("creditTarget");
		
		GiftCard card = getCardDetailsFromDB(code);
		
		if( card != null && !card.redeemed ) {
			Log.d("GiftCode good -- using code " + code + " to apply credit to account " + creditTarget);
			applyCreditToAccount(card, creditTarget);
			
			// Report success
			return;
		}	
		
		throw new WebEx.E50X(500, "", "Gift code provided has either been redeemed or does not exist");
	}
	
	// Retrieve giftcard details from ES
	// Will return null if no matching entry is found
	public GiftCard getCardDetailsFromDB(String code) {
		
		if( code == null) {
			return null;
		}
		
		// Hash code
		String hashedCode = StrUtils.sha1(code);
		
		// Check DB for code
		SearchRequestBuilder s = new SearchRequestBuilder(es);
		s.setIndex(esRouter.getPath(dataspace, type, null, KStatus.PUBLISHED).index());
		ESQueryBuilder filter = ESQueryBuilders.termQuery("code", hashedCode);
		
		s.setSize(10000);
		s.setDebug(true);
		s.setQuery(filter);
		SearchResponse sr = s.get();
		Map<String, Object> jobj = sr.getParsedJson();

		List<Map> hits = sr.getHits();
		
		if (hits == null || hits.size() == 0) {
			return null;
		}
		
		// Has it already been redeemed?
		Map hit = hits.get(0);
		GiftCard card = (GiftCard) hit.get("_source");
		
		return card;
	}
	
	// TODO: verify that credit is actually being added to the taget account
	// Looks like there might be an issue on front-end with /credit/_list pulling from index transfer.draft
	// Problem is that transfers only seem to be getting saved to transfer
	public void applyCreditToAccount(GiftCard card, String rawCreditTarget) {
		// TODO: apply credit to user account provided	
		if(rawCreditTarget == null) {
			throw new WebEx.E50X(500, "", "No creditTarget provided. Credit must be applied to a specific user account");
		}
		
		XId creditTarget = new XId(rawCreditTarget);
		
		Person user = DBSoGive.getCreateUser(creditTarget);
			
		Transfer t = new Transfer(new XId(card.generatedBy), creditTarget, card.amount);
		t.toPerson = user;
		t.publish();
		
		// Invalidate GiftCard
		card.redeemed = true;
		card.redeemedBy = rawCreditTarget;
		storeGiftCardInDB(card);
	}
	
}
