// GiftCards that can be redeemed for SoGive account credit
// Only hashed values of codes are stored in ES
// This is a simple security measure to prevent an intruder from claiming all unredeemed codes
package org.sogive.data.user;

import java.security.SecureRandom;

import org.sogive.data.commercial.Card;

import com.goodloop.data.KCurrency;
import com.goodloop.data.Money;
import com.winterwell.data.AThing;

/**
 * Give a money voucher. See {@link Card} which does not transfer money.
 * 
 * @author daniel
 *
 */
public class GiftCard extends AThing {

	// Used to randomly generate alpha-numeric code
	static final String alphaNumeric = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

	// How many digits long should codes be?
	static final int codeLength = 16;

	static SecureRandom random = new SecureRandom();

	// How much is the card worth?
	public Money amount;

	public String code;

	// Who created this giftcard?
	public String generatedBy;

	// Has the code already been claimed?
	public boolean redeemed;

	// Which user account claimed the card?
	public String redeemedBy;

	public GiftCard(Double amount, String generatedBy) {
		super();

		code = generateNewCode();
		redeemed = false;
		this.amount = new Money(KCurrency.GBP, amount);
		this.generatedBy = generatedBy;
	}

	private String generateNewCode() {
		StringBuilder sb = new StringBuilder(codeLength);
		for (int i = 0; i < codeLength; i++) {
			// Randomly select alpha-numeric character and append to output
			sb.append(alphaNumeric.charAt(random.nextInt(alphaNumeric.length())));
		}

		return sb.toString();
	}

}
