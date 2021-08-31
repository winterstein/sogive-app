package org.sogive.server;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.sogive.data.charity.NGO;
import org.sogive.data.charity.Output;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.charity.Thing;

import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.client.query.BoolQueryBuilder;
import com.winterwell.es.client.query.ESQueryBuilder;
import com.winterwell.es.client.query.ESQueryBuilders;
import com.winterwell.gson.Gson;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.web.ajax.AjaxMsg;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.BoolField;
import com.winterwell.web.fields.Checkbox;

public class CharityServlet extends CrudServlet<NGO> {
	
	public static BoolField NO_REDIRECT = new BoolField("noRedirect");

	public static NGO getCharity(String id, KStatus status) {
		ESPath path = Dep.get(SoGiveConfig.class).getPath(null, NGO.class, id, status);
		NGO got = AppUtils.get(path, NGO.class);
		if (got == null)
			return null;
		return got; // new JThing<NGO>().setType(NGO.class).setJava(got).java();
	}

	private final SoGiveConfig config;

	public CharityServlet() {
		super(NGO.class, Dep.get(SoGiveConfig.class));
		config = Dep.get(SoGiveConfig.class);
		augmentFlag = true;
	}

	@Override
	protected JThing<NGO> augment(JThing<NGO> jThing, WebRequest state) {
		NGO ngo = jThing.java();
		Output output = ngo.getSimpleImpact();
		jThing.setJava(ngo);
		return jThing;
	}

	@Override
	protected void doBeforeSaveOrPublish(JThing<NGO> _jthing, WebRequest stateIgnored) {
		augment(_jthing, stateIgnored); // insert simple-impact
		// revenue for sorting??
		super.doBeforeSaveOrPublish(_jthing, stateIgnored);
	}

	@Override
	protected ESQueryBuilder doList4_ESquery_custom(WebRequest state) {
		BoolQueryBuilder noUnlisted = ESQueryBuilders.boolQuery();
		if (state.get(new Checkbox("unlisted"))) {
			// Huh?? Well if you really want them, we can include them
		} else {
			// Normal: no unlisted
			noUnlisted = noUnlisted.mustNot(ESQueryBuilders.termQuery("unlisted", true));
		}
		// no redirects by default
		boolean r = state.get(new Checkbox("redirects"));
		ESQueryBuilder hasRedirect = ESQueryBuilders.existsQuery("redirect");
		if (r) {
			// Must have redirects? Odd but OK
			noUnlisted.must(hasRedirect);
		} else {
			// Normal - no redirects
			noUnlisted.mustNot(hasRedirect);
		}
		return noUnlisted;
	}

	@Override
	protected JThing<NGO> doNew(WebRequest state, String id) {
		String json = getJson(state);
		Map rawMap = Gson.fromJSON(json);

		// Make sure there's no ID collision!
		NGO existsPublished = getCharity(id, KStatus.PUBLISHED);
		NGO existsDraft = getCharity(id, KStatus.DRAFT);
		if (existsPublished != null || existsDraft != null) {
			state.addMessage(AjaxMsg.warningAboutInput("Cannot make new. " + id + " "
					+ (existsPublished == null ? "(draft) " : "") + "already exists. Please use the existing entry."
					+ (existsPublished == null ? " Being only a draft, the existing entry does not show in listings. "
							: "")));
			// NB: return draft by default, as doNew would normally make a draft
			JThing jt = new JThing(Utils.or(existsDraft, existsPublished));
			return jt;
		}

		// The given ID is OK: put it on the map and construct the NGO
		rawMap.put("@id", id);
		JThing jt = new JThing(Gson.toJSON(rawMap));
		NGO mod = Thing.getThing(jt.map(), NGO.class);
		assert mod.getId().equals(id) : mod + " " + id;
		jt.setJava(mod);
		return jt;
	}

	@Override
	protected void doSave(WebRequest state) {
		AppUtils.DEBUG = true; // TODO delete debugging £ bug
		super.doSave(state);
		AppUtils.DEBUG = false;
	}

	@Override
	protected String getId(WebRequest state) {
		String json = getJson(state);
		Map map = Gson.fromJSON(json);
		if (map == null)
			return super.getId(state);

		String id = (String) map.get("@id");
		if (!Utils.isBlank(id))
			return id;
		id = (String) map.get("id");
		if (!Utils.isBlank(id))
			return id;

		// deprecated fallback
		String name = (String) map.get("name");
		id = name == null ? null : NGO.idFromName(name);
		if (Utils.isBlank(id)) {
			return super.getId(state);
		} else {
			return id;
		}
	}

	@Override
	protected String getJson(WebRequest state) {
		return state.get(AppUtils.ITEM.getName());
	}

	@Override
	protected JThing<NGO> getThingFromDB(WebRequest state) {
		return getThingFromDB2(state, new ArrayList());
	}

	protected JThing<NGO> getThingFromDB2(WebRequest state, List<String> ids) {
		JThing<NGO> thing = super.getThingFromDB(state);
		if (thing == null) {
			return null;
		}
		// redirect from a 2nd id to the main one?
		String redirect = thing.java().getRedirect();
		if (redirect == null) {
			return thing;
		}
		
		// Don't traverse redirects when explicitly directed not to
		Boolean noRedirect = state.get(NO_REDIRECT);
		// Don't traverse redirects during a save
		if (state.actionIs(ACTION_SAVE) || state.actionIs(ACTION_PUBLISH)) noRedirect = true;
		if (noRedirect) {
			return thing;
		}
		
		// paranoia: detect loops
		ids.add(thing.java().getId());
		if (ids.contains(redirect)) {
			Log.e(LOGTAG(), "redirect loop! " + redirect + " " + state);
			state.addMessage(AjaxMsg.error("redirect-loop", "Redirect loop: " + ids));
			return thing;
		}
		// ...recurse with a new ID
		setId(redirect); // hack
		JThing<NGO> thing2 = getThingFromDB2(state, ids);
		if (thing2 == null) {
			state.addMessage(AjaxMsg.error("broken-redirect", "Redirect leads to 404: " + ids));
		}
		return thing2;
	}

	@Override
	public void process(WebRequest state) throws Exception {
		super.process(state);
	}
}
