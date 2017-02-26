package com.winterwell.es.client;

import static org.junit.Assert.*;

import java.util.Map;

import org.eclipse.jetty.util.ajax.JSON;
import org.junit.Test;

import com.google.gson.FlexiGson;

public class ESHttpResponseTest {

	@Test
	public void testGetParsedJson() {
		// Check all the json parsers can handle it
		String json = "{\"took\":3,\"timed_out\":false,\"_shards\":{\"total\":5,\"successful\":5,\"failed\":0},\"hits\":{\"total\":6,\"max_score\":1.0,\"hits\":[{\"_index\":\"donation\",\"_type\":\"donation\",\"_id\":\"500 daniel@winterwell.com@Email to solar-aid@sogive at 24801782\",\"_score\":1.0,\"_source\":{\"@class\":\"org.sogive.data.user.Donation\",\"id\":\"500 daniel@winterwell.com@Email to solar-aid@sogive at 24801782\",\"from\":{\"@class\":\"com.winterwell.web.data.XId\",\"name\":\"daniel@winterwell.com\",\"service\":\"Email\"},\"to\":{\"@class\":\"com.winterwell.web.data.XId\",\"name\":\"solar-aid\",\"service\":\"sogive\"},\"collected\":false,\"paidOut\":false,\"giftAid\":false,\"total\":{\"value100\":500,\"@type\":\"MonetaryAmount\",\"currency\":\"GBP\",\"value\":5.0},\"time\":{\"@class\":\"com.winterwell.utils.time.Time\",\"ut\":1488106952348}}},{\"_index\":\"donation\",\"_type\":\"donation\",\"_id\":\"500 daniel@winterwell.com@Email to solar-aid@sogive at 24801805\",\"_score\":1.0,\"_source\":{\"@class\":\"org.sogive.data.user.Donation\",\"id\":\"500 daniel@winterwell.com@Email to solar-aid@sogive at 24801805\",\"from\":{\"@class\":\"com.winterwell.web.data.XId\",\"name\":\"daniel@winterwell.com\",\"service\":\"Email\"},\"to\":{\"@class\":\"com.winterwell.web.data.XId\",\"name\":\"solar-aid\",\"service\":\"sogive\"},\"collected\":false,\"paidOut\":false,\"giftAid\":false,\"total\":{\"value100\":500,\"@type\":\"MonetaryAmount\",\"currency\":\"GBP\",\"value\":5.0},\"time\":{\"@class\":\"com.winterwell.utils.time.Time\",\"ut\":1488108339329}}},{\"_index\":\"donation\",\"_type\":\"donation\",\"_id\":\"500 daniel@winterwell.com@Email to solar-aid@sogive at 24801781\",\"_score\":1.0,\"_source\":{\"@class\":\"org.sogive.data.user.Donation\",\"id\":\"500 daniel@winterwell.com@Email to solar-aid@sogive at 24801781\",\"from\":{\"@class\":\"com.winterwell.web.data.XId\",\"name\":\"daniel@winterwell.com\",\"service\":\"Email\"},\"to\":{\"@class\":\"com.winterwell.web.data.XId\",\"name\":\"solar-aid\",\"service\":\"sogive\"},\"collected\":false,\"paidOut\":false,\"giftAid\":false,\"total\":{\"value100\":500,\"@type\":\"MonetaryAmount\",\"currency\":\"GBP\",\"value\":5.0},\"time\":{\"@class\":\"com.winterwell.utils.time.Time\",\"ut\":1488106900592}}},{\"_index\":\"donation\",\"_type\":\"donation\",\"_id\":\"1000 daniel@sodash.com@Email to solar-aid@sogive at 24800313\",\"_score\":1.0,\"_source\":{\"@class\":\"org.sogive.data.user.Donation\",\"id\":\"1000 daniel@sodash.com@Email to solar-aid@sogive at 24800313\",\"from\":{\"@class\":\"com.winterwell.web.data.XId\",\"name\":\"daniel@sodash.com\",\"service\":\"Email\"},\"to\":{\"@class\":\"com.winterwell.web.data.XId\",\"name\":\"solar-aid\",\"service\":\"sogive\"},\"collected\":false,\"paidOut\":false,\"giftAid\":false,\"total\":{\"value100\":1000,\"@type\":\"MonetaryAmount\",\"currency\":\"GBP\",\"value\":10.0},\"time\":{\"@class\":\"com.winterwell.utils.time.Time\",\"ut\":1488018792485}}},{\"_index\":\"donation\",\"_type\":\"donation\",\"_id\":\"500 daniel@winterwell.com@Email to solar-aid@sogive at 24801784\",\"_score\":1.0,\"_source\":{\"@class\":\"org.sogive.data.user.Donation\",\"id\":\"500 daniel@winterwell.com@Email to solar-aid@sogive at 24801784\",\"from\":{\"@class\":\"com.winterwell.web.data.XId\",\"name\":\"daniel@winterwell.com\",\"service\":\"Email\"},\"to\":{\"@class\":\"com.winterwell.web.data.XId\",\"name\":\"solar-aid\",\"service\":\"sogive\"},\"collected\":false,\"paidOut\":false,\"giftAid\":false,\"total\":{\"value100\":500,\"@type\":\"MonetaryAmount\",\"currency\":\"GBP\",\"value\":5.0},\"time\":{\"@class\":\"com.winterwell.utils.time.Time\",\"ut\":1488107080828}}},{\"_index\":\"donation\",\"_type\":\"donation\",\"_id\":\"500 daniel@winterwell.com@Email to solar-aid@sogive at 24801811\",\"_score\":1.0,\"_source\":{\"@class\":\"org.sogive.data.user.Donation\",\"id\":\"500 daniel@winterwell.com@Email to solar-aid@sogive at 24801811\",\"from\":{\"@class\":\"com.winterwell.web.data.XId\",\"name\":\"daniel@winterwell.com\",\"service\":\"Email\"},\"to\":{\"@class\":\"com.winterwell.web.data.XId\",\"name\":\"solar-aid\",\"service\":\"sogive\"},\"collected\":true,\"paidOut\":false,\"giftAid\":false,\"total\":{\"value100\":500,\"@type\":\"MonetaryAmount\",\"currency\":\"GBP\",\"value\":5.0},\"time\":{\"@class\":\"com.winterwell.utils.time.Time\",\"ut\":1488108669929}}}]}}";

		Object jobj = JSON.parse(json);
		
		Map jobj2 = FlexiGson.fromJSON(json);
		
		Object jobj3 = new ESHttpClient().gson.fromJson(json);
	}

}
