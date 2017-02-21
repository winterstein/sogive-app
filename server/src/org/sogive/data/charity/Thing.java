package org.sogive.data.charity;

import java.util.HashMap;

import com.winterwell.utils.time.Time;

/**
 * https://schema.org/Thing
 * @author daniel
 *
 */
public class Thing extends HashMap {
	
	/**
	 * "@id" Can be null!
	 * @return
	 */
	public String getId() {
		return (String) get("@id");
	}
	
	public Thing() {
		put("@type", getClass().getSimpleName());
	}
	
	private static final long serialVersionUID = 1L;
	
	public static final String description = "description";
	public static final String name = "name";
	public static final String image = "image";
	public static final String url = "url";
	
	void setPeriod(Time start, Time end) {
		put("start", start);
		put("end", end);
		// also store the year, which
		if (end!=null) {
			put("year", end.getYear());
		}
	}
}
