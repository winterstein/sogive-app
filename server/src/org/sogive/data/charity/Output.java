package org.sogive.data.charity;

import com.winterwell.utils.StrUtils;

public class Output extends Thing {

	private static final long serialVersionUID = 1L;

	/**
	 * 
	 * @param number
	 * @param type e.g. "solar-light"
	 * @param unit 
	 */
	Output(double number, String type, String unit) {
		put("number", number);
		put("type", StrUtils.toCanonical(type));
		put("label", type);
		put("unit", StrUtils.toCanonical(unit));
	}
	
	Output setIndirect(boolean indirect) {
		put("indirect", indirect);
		return this;
	}
	
}
