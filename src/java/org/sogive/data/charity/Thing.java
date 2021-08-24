package org.sogive.data.charity;

import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.BiPredicate;

import javax.lang.model.SourceVersion;

import com.winterwell.depot.IInit;
import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.MathUtils;
import com.winterwell.utils.ReflectionUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.time.Time;

/**
 * https://schema.org/Thing
 * 
 * @author daniel
 *
 * @deprecated This turns out to be an awkward approach. AThing is more Java, or
 *             one could use data-classes as we do in js
 */
public class Thing<SubThing extends Thing> extends HashMap<String, Object> implements IInit {

	public static final String description = "description";

	public static final String ID = "@id";

	public static final String image = "image";

	public static final String name = "name";

	private static final long serialVersionUID = 1L;

	public static final String url = "url";

	public static <T extends Thing> List<T> getLatestYear(List<T> inputs) {
		if (inputs.isEmpty())
			return inputs;
		long max = inputs.stream().map(t -> Utils.or(t.getYear(), 0L)).max(Long::compare).get();
		if (max == 0)
			return inputs;
		List<T> yearMatch = Containers.filter(inputs, t -> Utils.or(t.getYear(), 0L) == max);
		return yearMatch;
	}

	public static <X extends IInit> X getThing(Object obj, Class<X> klass) {
		if (obj == null) {
			Log.w("Thing", "null input = null for " + klass + " at " + ReflectionUtils.getSomeStack(12));
			return null;
		}
		if (obj instanceof Thing)
			return (X) obj;
		Gson gson = Dep.get(Gson.class);
		if (obj instanceof String) {
			Object map = gson.fromJson((String) obj);
			assert !(map instanceof String) : map;
			return getThing(map, klass);
		}
		try {
			Map map = (Map) obj;
			Constructor<X> deccons = klass.getDeclaredConstructor();
//			Constructor<X> cons = klass.getConstructor();
			deccons.setAccessible(true);
			X thing = deccons.newInstance();
			if (thing instanceof Thing) {
				((Thing) thing).putAll(map);
			} else {
				putIntoObject(thing, map);
			}
			thing.init();
			return thing;
		} catch (Exception ex) {
			throw Utils.runtime(ex);
		}
	}

	public static <X extends IInit> List<X> getThings(List list, Class<X> klass) {
		if (list == null)
			return null;
		List things = Containers.apply(Containers.filterNulls(list), obj -> getThing(obj, klass));
		return things;
	}

	protected static List list(Object object) {
//		Containers.list(object) ??
		return object == null ? null : Containers.asList(object);
	}

	/**
	 * NB: allows for bad / extra data, which is skipped over
	 * 
	 * @param thing
	 * @param map
	 */
	private static void putIntoObject(Object thing, Map<String, Object> map) {
		for (Map.Entry<String, Object> e : map.entrySet()) {
			String key = null;
			Object value = null;
			try {
				key = e.getKey();
				if (!SourceVersion.isName(key)) {
					continue; // skip eg. "@type"
				}
				value = e.getValue();
				ReflectionUtils.setPrivateField(thing, key, value);
			} catch (Throwable ex) {
				Log.w(thing.getClass().getSimpleName(), "Put " + key + " = " + value + ": " + ex);
			}
		}
	}

	public Thing() {
		put("@type", getClass().getSimpleName());
	}

	public <T extends IInit> List<T> addOrMerge(String property, T thing) {
		return addOrMerge(property, thing, Utils::equals);
	}

	<T extends IInit> List<T> addOrMerge(String property, T thing, BiPredicate<T, T> matcher) {
		assert !Utils.isBlank(property);
		List<T> projects = list(getThings(property, thing.getClass()));
		if (projects == null) {
			projects = new ArrayList();
			put(property, projects);
		}
		for (T pold : projects) {
			if (!matcher.test(pold, thing))
				continue;
			if (pold instanceof Thing) {
				((Thing) pold).mergeIn((Thing) thing);
			}
			return projects;
		}
		projects.add(thing);
		return projects;
	}

	/**
	 * 
	 * @param key
	 * @return null if unset
	 */
	public Double getDouble(String key) {
		Object v = get(key);
		if (v == null)
			return null;
		if (v instanceof String && Utils.isBlank((String) v)) {
			return null;
		}
		return MathUtils.getNumber(v);
	}
	/**
	 * "@id" Can be null!
	 * 
	 * @return
	 */
	public String getId() {
		return (String) get(ID);
	}
	public final Long getLong(String key) {
		Object v = get(key);
		if (v == null)
			return null;
		if (v instanceof Number)
			return ((Number) v).longValue();
		return Long.valueOf((String) v);
	}
	public final String getName() {
		return (String) get("name");
	}

	private <T extends IInit> List<T> getThings(String property, Class<T> klass) {
		List list = list(get(property));
		if (list == null)
			return null;
		List<T> things = getThings(list, klass);
		put(property, things);
		return things;
	}

	public final Long getYear() {
		return getLong("year");
	}

	public void init() {
	}

	SubThing mergeIn(SubThing other) {
		Set<Map.Entry<String, Object>> eset = other.entrySet();
		for (Map.Entry<String, Object> pv : eset) {
			Object value = pv.getValue();
			// TODO handle lists
			put(pv.getKey(), value);
		}
		return (SubThing) this;
	}

	/**
	 * Remove on null. Treats blank "" value as null
	 */
	@Override
	public Object put(String key, Object value) {
		if (value instanceof String && Utils.isBlank((String) value)) {
			value = null;
		}
		if (value == null) {
			return remove(key);
		}
		return super.put(key, value);
	}

	void setPeriod(Time start, Time end) {
		if (start != null)
			put("start", start.toISOString());
		if (end != null)
			put("end", end.toISOString());
		// also store the year, which
		if (end != null) {
			put("year", end.getYear());
		}
	}

}
