package org.sogive.data.user;

import com.goodloop.data.Money;
import com.winterwell.web.data.XId;

/**
 * Money + cause
 * 
 * @author daniel
 *
 */
public class MoneyItem {

	/**
	 * For a contribution -- the person paying. For a fee: blank.
	 */
	XId from;

	final Money money;

	String text;

	/**
	 * For a fee -- the person being paid. For a contribution: blank;
	 */
	XId to;

	public MoneyItem(String text, Money money) {
		this.money = money;
		this.text = text;
	}

	public String getText() {
		return text;
	}
}
