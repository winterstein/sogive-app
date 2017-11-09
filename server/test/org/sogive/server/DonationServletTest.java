package org.sogive.server;

import static org.junit.Assert.*;

import java.util.Map;

import org.eclipse.jetty.util.ajax.JSON;
import org.junit.Test;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.user.Person;

import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.web.FakeBrowser;

/**
 * TODO integration test for servlet
 * 
 * @author daniel
 *
 */
public class DonationServletTest {

	@Test
	public void testMakeDonationNotLoggedIn() {
		// fire up a server
		String host = SoGiveTestUtils.getStartServer();
		
		// make a save + publish call with test Stripe details
		FakeBrowser fb = new FakeBrowser();
		
	}

	@Test
	public void testMakeDonation_ToFundRaiser_LoggedIn() {
		// fire up a server
		String host = SoGiveTestUtils.getStartServer();
		
		Person user = SoGiveTestUtils.doTestUserLogin(host);
		
		FundRaiser fr = SoGiveTestUtils.getTestFundRaiser();
		
		// make a save + publish call with test Stripe details
		FakeBrowser fb = new FakeBrowser();
		
	}
	
	
	@Test
	public void testListForFundRaiser() {
		// fire up a server
		String host = SoGiveTestUtils.getStartServer();
		
		FundRaiser fr = SoGiveTestUtils.getTestFundRaiser();
		
		FakeBrowser fb = new FakeBrowser();
		String listjson = fb.getPage(host+"/donation/list.json", new ArrayMap(
				"q", "fundRaiser:"+fr.id
				));
		Map response = (Map) JSON.parse(listjson);
		Object list = response.get("cargo");
		System.out.println(list);
	}
}
