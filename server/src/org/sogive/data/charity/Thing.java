package org.sogive.data.charity;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.BiPredicate;
import java.util.function.Predicate;

import com.winterwell.utils.Utils;
import com.winterwell.utils.time.Time;

/**
 * https://schema.org/Thing
 * @author daniel
 *
 */
public class Thing<SubThing extends Thing> extends HashMap<String,Object> {
	
	SubThing mergeIn(SubThing other) {
		Set<Map.Entry<String, Object>> eset = other.entrySet();
		for(Map.Entry<String, Object> pv : eset) {
			Object value = pv.getValue();
			// TODO handle lists
			put(pv.getKey(), value);
		}
		return (SubThing) this;
	}

	public final String getName() {
		return (String) get("name");
	}
	
	public <T extends Thing> List<T> addOrMerge(String property, T thing) {
		return addOrMerge(property, thing, Utils::equals);
	}
	
	<T extends Thing> List<T> addOrMerge(String property, T thing, BiPredicate<T,T> matcher) {
		assert ! Utils.isBlank(property);
		List<T> projects = (List) get(property);
		if (projects==null) {
			projects = new ArrayList();
			put(property, projects);
		}
		for (T pold : projects) {
			if ( ! matcher.test(pold, thing)) continue;
			pold.mergeIn(thing);
			return projects;
		}
		projects.add(thing);
		return projects;
	}
	
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
