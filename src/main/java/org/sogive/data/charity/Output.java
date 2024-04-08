package org.sogive.data.charity;

import java.util.Map;

import com.goodloop.data.Money;
import com.winterwell.utils.StrUtils;
import com.winterwell.web.ajax.JThing;

/**
 * This is also the type for Impact! See Output.js which documents this type
 * better
 * 
 * @author daniel
 *
 */
public class Output extends Thing<Output> {

	private static final long serialVersionUID = 1L;

	public static boolean match(Output a, Output b) {
		if (a == b)
			return true;
		if (a.getName() != null && b.getName() != null) {
			return a.getName().equals(b.getName());
		}
		return a.equals(b);
	}

	Output() {

	}

	/**
	 * 
	 * @param number How many malaria nets or nurses or kittens? Can be null for
	 *               unquantified
	 * @param type   e.g. "solar-light"
	 */
	public Output(Double number, String type) { // , String unit) {
		put("number", number);
//		put("type", StrUtils.toCanonical(type));
		put("name", type);
//		put("unit", StrUtils.toCanonical(unit));
		assert number == null || number >= 0 : this;
	}

	/**
	 * amount is for non-numerical descriptions of how much was output
	 * 
	 * @return
	 */
	public String getAmount() {
		return StrUtils.str(get("amount"));
	}

	public Money getCostPerBeneficiary() {
		Object cpb = get("costPerBeneficiary");
		if (cpb == null)
			return null;
		if (cpb instanceof Money)
			return (Money) cpb;
		return (Money) new JThing().setType(Money.class).setMap((Map) cpb).java();
	}

	/**
	 * 
	 * @return default to 1
	 */
	public double getNumber() {
		Double n = getDouble("number");
		return n==null? 1 : n;
	}

	/**
	 * A fresh output scaled by fraction. E.g. use case: If total costs were £100,
	 * and I donate £1, then scale by 0.01, to get my impact. TODO This can also
	 * change the unit, e.g. from years to days.
	 * 
	 * @param input
	 */
	public Output scale(double fraction) {
		// the number
		assert fraction >= 0 : fraction + " " + this;
		Double number = getNumber();
		Output scaled;
		if (number == null) {
			scaled = new Output(null, getName());
		} else {
			number = number * fraction;
			// String type = (String) get("type");
			// String unit = (String) getName();
			// TODO adjust the unit?
			scaled = new Output(number, getName());
		}
		// copy other properties, e.g. image
		for (Map.Entry<String, Object> pv : entrySet()) {
			if (scaled.containsKey(pv.getKey()))
				continue;
			scaled.put(pv.getKey(), pv.getValue());
		}
		return scaled;
	}

	public void setCostPerBeneficiary(Money cpb) {
		put("costPerBeneficiary", cpb);
	}

	Output setIndirect(boolean indirect) {
		put("indirect", indirect);
		return this;
	}

	public void setName(String name) {
		put("name", name);
	}

}
