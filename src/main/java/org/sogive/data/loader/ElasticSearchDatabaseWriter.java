package org.sogive.data.loader;

import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig;

import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.utils.Dep;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;

public class ElasticSearchDatabaseWriter implements DatabaseWriter {
	@Override
	public KStatus contains(String charityId) {
		ESPath publishedPath = Dep.get(SoGiveConfig.class).getPath(null, NGO.class, charityId, KStatus.PUBLISHED);
		if (AppUtils.get(publishedPath, NGO.class) != null) {
			return KStatus.PUBLISHED;
		}
		ESPath draftPath = Dep.get(SoGiveConfig.class).getPath(null, NGO.class, charityId, KStatus.DRAFT);
		if (AppUtils.get(draftPath, NGO.class) != null) {
			return KStatus.DRAFT;
		}
		return KStatus.ABSENT;
	}

	@Override
	public void updateCharityRecord(NGO ngo, KStatus KStatus) {
		String charityId = ngo.getId();
		ESPath draftPath = Dep.get(IESRouter.class).getPath(NGO.class, charityId, KStatus.DRAFT);
		if (KStatus == KStatus.DRAFT) {
			AppUtils.doSaveEdit(draftPath, new JThing(ngo), null, null);
		}
		if (KStatus == KStatus.PUBLISHED) {
			ESPath pubPath = Dep.get(IESRouter.class).getPath(NGO.class, charityId, KStatus.PUBLISHED);
			AppUtils.doPublish(new JThing(ngo), draftPath, pubPath);
		}
	}
}
