package org.sogive.data.charity;

import java.math.BigDecimal;

import com.goodloop.data.KCurrency;

public class Money extends com.goodloop.data.Money {
	
	String raw;
	
	public Money() {
		super();
	}
	
	public Money(KCurrency gbp, Number bigDecimal) {
		super(gbp, bigDecimal);
	}

	public Money(com.goodloop.data.Money money) {
		this(money.currency, money.getValue());
		setName(money.getName());
	}

	public static Money pound(double number) {
		return new Money(KCurrency.GBP, new BigDecimal(number));
	}
	
	@Override
	public Money minus(com.goodloop.data.Money x) {	
		return new Money(super.minus(x));
	}
	
	@Override
	public Money plus(com.goodloop.data.Money x) {	
		return new Money(super.plus(x));
	}
}
