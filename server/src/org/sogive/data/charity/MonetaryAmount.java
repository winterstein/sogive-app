package org.sogive.data.charity;

import java.util.HashMap;

import org.apache.commons.lang3.Validate;

import com.winterwell.utils.MathUtils;
import com.winterwell.utils.Printer;
import com.winterwell.utils.Utils;
import com.winterwell.utils.time.Time;

public class MonetaryAmount extends Thing<MonetaryAmount> {
	private static final long serialVersionUID = 1L;

	MonetaryAmount() {	
	}
	
	/**
	 * Assume £s
	 * @param value100 The pence / cents. This is to avoid rounding errors.
	 */
	public MonetaryAmount(long value100) {
		// ISO 4217 £
		this(value100, "GBP");
	}
	

	/**
	 * 
	 * @param value100 The pence / cents. This is to avoid rounding errors.
	 */
	public MonetaryAmount(long value100, String currency) {
		put("currency", currency);
		put("value", value100/100.0);
		put("value100", value100);
		assert ! Utils.isBlank(currency);
	}


	public MonetaryAmount minus(MonetaryAmount x) {
		return new MonetaryAmount(getValue100() - x.getValue100());
	}


	public double getValue() {
		return MathUtils.toNum(get("value"));
	}
	
	public long getValue100() {
		validate();
		Object v100 = get("value100");
		if (v100 instanceof Number) {
			return ((Number) v100).longValue();
		}
		// default to zero
		assert getValue()==0 : new HashMap(this);
		return 0;
	}


	public MonetaryAmount validate() {
		// check v100 = 100*v
		double v = MathUtils.toNum(get("value"));
		long v100 = (long) MathUtils.toNum(get("value100"));
		if (v100 != 100*v) {
			v100 = (long) (v*100);
			put("value100", v100);
		}
		return this;
	}

	public static MonetaryAmount pound(double number) {
		return new MonetaryAmount((long) (number*100));
	}

	

	@Override
	public String toString() {
		return "MonetaryAmount[£" + Printer.prettyNumber(getValue()) + ", name=" + getName() + "]";
	}

	public String getCurrency() {
		return (String) get("currency");
	}
}
