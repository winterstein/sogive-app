package org.sogive.server.payment;

import com.winterwell.utils.io.Option;

public class StripeConfig {

	@Option
	String pubKey;

	@Option
	String secretKey;

	@Option
	String testPubKey;

	@Option
	String testSecretKey;

	@Option(description = "Default to true (test) for safety, so you have to explicitly request 'its real money'")
	boolean testStripe = true;

	public StripeConfig() {
	}
}
