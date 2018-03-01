package org.sogive.data.charity;

import java.util.HashMap;

import org.apache.commons.lang3.Validate;

import com.goodloop.data.KCurrency;
import com.winterwell.utils.MathUtils;
import com.winterwell.utils.Printer;
import com.winterwell.utils.Utils;
import com.winterwell.utils.time.Time;

/**
 * TODO it'd be nice to replace this with {@link com.goodloop.data.Money}
 * However that would require lots of changes (and risk).
 * 
 * @author daniel
 *
 */
public class Money extends Thing<Money> {
	private static final long serialVersionUID = 1L;

	public Money() {	
	}
	
	/**
	 * Assume £s
	 * @param value100 The pence / cents. This is to avoid rounding errors.
	 */
	public Money(long value100) {
		// ISO 4217 £
		this(value100, "GBP");
	}
	

	/**
	 * 
	 * @param value100 The pence / cents. This is to avoid rounding errors.
	 */
	public Money(long value100, String currency) {
		put("currency", currency);
		put("value", value100/100.0);
		put("value100", value100);
		assert ! Utils.isBlank(currency);
	}

	public Money plus(Money x) {
		return new Money(getValue100() + x.getValue100());
	}
	
	public Money plus(com.goodloop.data.Money x) {
		return new Money(getValue100() + x.getValue100p()/100);
	}

	public Money minus(Money x) {
		return new Money(getValue100() - x.getValue100());
	}

	public Money minus(com.goodloop.data.Money x) {
		return new Money(getValue100() - x.getValue100p()/100);
	}

	public double getValue() {
		return MathUtils.toNum(get("value"));
	}
	
	public long getValue100() {
		init();
		Object v100 = get("value100");
		if (v100 instanceof Number) {
			return ((Number) v100).longValue();
		}
		// default to zero
		assert getValue()==0 : new HashMap(this);
		return 0;
	}


	public void init() {
		// check v100 = 100*v
		double v = MathUtils.toNum(get("value"));
		long v100 = (long) MathUtils.toNum(get("value100"));
		if (v100 != 100*v) {
			v100 = (long) (v*100);
			put("value100", v100);
		}
	}

	public static Money pound(double number) {
		return new Money((long) (number*100));
	}

	

	@Override
	public String toString() {
		return "Money[£" + Printer.prettyNumber(getValue()) + ", name=" + getName() + "]";
	}

	public String getCurrency() {
		return (String) get("currency");
	}

	/**
	 * HACK convertor
	 * @return
	 */
	public com.goodloop.data.Money asMoney() {
		KCurrency curr = getCurrency()==null? KCurrency.GBP : KCurrency.valueOf(getCurrency().toUpperCase());
		return new com.goodloop.data.Money(curr, getValue());
	}

}
