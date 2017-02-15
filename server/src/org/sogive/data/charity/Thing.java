package org.sogive.data.charity;

import java.util.HashMap;

/**
 * https://schema.org/Thing
 * @author daniel
 *
 */
public class Thing extends HashMap {
	
	public Thing() {
		put("@type", getClass().getSimpleName());
	}
	
	private static final long serialVersionUID = 1L;
	
	public static final String description = "description";
	public static final String name = "name";
	public static final String image = "image";
	public static final String url = "url";
	
}
