package org.sogive.data.loader;

import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.utils.Dep;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;
import org.sogive.data.charity.NGO;

public class ElasticSearchDatabaseWriter implements DatabaseWriter {
    @Override
    public void upsertCharityRecord(NGO ngo) {
        String charityId = ngo.getId();
        ESPath draftPath = Dep.get(IESRouter.class).getPath(NGO.class, charityId, KStatus.DRAFT);
        ESPath pubPath = Dep.get(IESRouter.class).getPath(NGO.class, charityId, KStatus.PUBLISHED);
        AppUtils.doPublish(new JThing(ngo), draftPath, pubPath);
    }
}
