// GiftCards that can be redeemed for SoGive account credit
// Only hashed values of codes are stored in ES
// This is a simple security measure to prevent an intruder from claiming all unredeemed codes
package org.sogive.data.user;

import java.security.SecureRandom;

import com.goodloop.data.KCurrency;
import com.goodloop.data.Money;
import com.winterwell.data.AThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;

public class GiftCard extends AThing {
	
	public String code;
	
	// How much is the card worth?
	public Money amount;
	
	// Has the code already been claimed?
	public boolean redeemed;
	
	// Which user account claimed the card?
	public String redeemedBy;
	
	// Who created this giftcard?
	public String generatedBy;
	
	// How many digits long should codes be?
	static final int codeLength = 16;
	
	// Used to randomly generate alpha-numeric code
	static final String alphaNumeric = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	static SecureRandom random = new SecureRandom();
	
	public GiftCard(Double amount, String generatedBy) {
		super();
		
		code = generateNewCode();
		redeemed = false;
		this.amount = new Money(KCurrency.GBP, amount);
		this.generatedBy = generatedBy;
	}
	
	
	private String generateNewCode() {
		StringBuilder sb = new StringBuilder(codeLength);
		for( int i = 0; i < codeLength; i++) {
			// Randomly select alpha-numeric character and append to output
			sb.append(alphaNumeric.charAt(random.nextInt(alphaNumeric.length())));
		}
		
		return sb.toString();
	}

}
