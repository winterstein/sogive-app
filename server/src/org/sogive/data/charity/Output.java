package org.sogive.data.charity;

import java.util.Map;

import com.winterwell.utils.MathUtils;
import com.winterwell.utils.StrUtils;

public class Output extends Thing<Output> {

	private static final long serialVersionUID = 1L;
	
	public static boolean match(Output a, Output b) {
		if (a==b) return true;
		if (a.getName()!=null && b.getName()!=null) {
			return a.getName().equals(b.getName());
		}
		return a.equals(b);
	}
	
	/**
	 * 
	 * @param number
	 * @param type e.g. "solar-light"
	 * @param unit e.g. year | thing
	 */
	public Output(double number, String type, String unit) {
		put("number", number);
		put("type", StrUtils.toCanonical(type));
		put("name", type);
		put("unit", StrUtils.toCanonical(unit));
	}
	
	
	Output() {
		
	}
	
	Output setIndirect(boolean indirect) {
		put("indirect", indirect);
		return this;
	}
	
	/**
	 * A fresh output scaled by fraction.
	 * E.g. use case: If total costs were £100, and I donate £1, then scale by 0.01, to get my impact.
	 * TODO This can also change the unit, e.g. from years to days.
	 * @param input
	 */
	public Output scale(double fraction) {
		double number = getDouble("number");
		number = number * fraction;
		String type = (String) get("type");
		String unit = (String) get("unit");
		// TODO adjust the unit?
		Output scaled = new Output(number, type, unit);
		// copy other properties, e.g. image
		for(Map.Entry<String, Object> pv : entrySet()) {
			if (scaled.containsKey(pv.getKey())) continue;
			scaled.put(pv.getKey(), pv.getValue());
		}
		return scaled;
	}

	public void setName(String name) {
		put("name", name);
	}

	
}
