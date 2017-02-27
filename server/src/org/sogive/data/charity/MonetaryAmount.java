package org.sogive.data.charity;

import com.winterwell.utils.MathUtils;
import com.winterwell.utils.time.Time;

public class MonetaryAmount extends Thing<MonetaryAmount> {
	private static final long serialVersionUID = 1L;

	MonetaryAmount() {	
	}
	
	/**
	 * 
	 * @param value100 The pence / cents. This is to avoid rounding errors.
	 */
	public MonetaryAmount(long value100) {
		// ISO 4217 £
		put("currency", "GBP");
		put("value", value100/100.0);
		put("value100", value100);
	}


	public MonetaryAmount minus(MonetaryAmount x) {
		return new MonetaryAmount(getValue100() - x.getValue100());
	}


	public double getValue() {
		return MathUtils.toNum(get("value"));
	}
	
	public long getValue100() {
		return ((Number) get("value100")).longValue();
	}


	public static MonetaryAmount pound(double number) {
		return new MonetaryAmount((long) (number*100));
	}

	

	@Override
	public String toString() {
		return "MonetaryAmount[£" + getValue() + ", name=" + getName() + "]";
	}

	public String getCurrency() {
		return (String) get("currency");
	}
}
