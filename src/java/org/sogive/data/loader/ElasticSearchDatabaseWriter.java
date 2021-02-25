package org.sogive.data.loader;

import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.utils.Dep;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;
import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig;

public class ElasticSearchDatabaseWriter implements DatabaseWriter {
    @Override
    public void upsertCharityRecord(NGO ngo, Status status) {
        String charityId = ngo.getId();
        ESPath draftPath = Dep.get(IESRouter.class).getPath(NGO.class, charityId, KStatus.DRAFT);
        if (status == Status.DRAFT) {
            AppUtils.doSaveEdit(draftPath, new JThing(ngo), null);
        }
        if (status == Status.PUBLISHED) {
            ESPath pubPath = Dep.get(IESRouter.class).getPath(NGO.class, charityId, KStatus.PUBLISHED);
            AppUtils.doPublish(new JThing(ngo), draftPath, pubPath);
        }
    }

    @Override
    public Status contains(String charityId) {
        ESPath publishedPath = Dep.get(SoGiveConfig.class).getPath(null, NGO.class, charityId, KStatus.PUBLISHED);
        if (AppUtils.get(publishedPath, NGO.class) != null) {
            return Status.PUBLISHED;
        }
        ESPath draftPath = Dep.get(SoGiveConfig.class).getPath(null, NGO.class, charityId, KStatus.DRAFT);
        if (AppUtils.get(draftPath, NGO.class) != null) {
            return Status.DRAFT;
        }
        return Status.ABSENT;
    }
}
