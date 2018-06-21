package org.sogive.data.user;

import com.goodloop.data.Money;
import com.winterwell.web.data.XId;

import lombok.Data;

/**
 * Money + cause
 * @author daniel
 *
 */
@Data
public class MoneyItem {

	public MoneyItem(String text, Money money) {
		this.money = money;
		this.text = text;
	}

	Money money;
	
	String text;
	
	/**
	 * For a contribution -- the person paying. For a fee: blank.
	 */
	XId from;
	
	/**
	 * For a fee -- the person being paid. For a contribution: blank;
	 */
	XId to;
}
