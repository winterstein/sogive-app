package org.sogive.data.charity;

import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;

public class SoGiveConfig implements IESRouter {

//	public static final String charityType = "charity";
//
//	public static final String charityIndex = "charity";
//	
//	public String charityDraftIndex = "charity_draft";
//
//	public static final String donationIndex = "donation";
	
	public int port = 8282;
	
	public String youagainApp = "sogive";

	@Override
	public ESPath getPath(Class type, String id, Object status) {
		String stype = type==NGO.class? "charity" : type.getSimpleName().toLowerCase();
		String index = stype;
		KStatus ks = (KStatus) status;
		if (ks==null) ks = KStatus.PUBLISHED;
		switch(ks) {
		case PUBLISHED:
			break;
		case DRAFT: case PENDING: case REQUEST_PUBLISH:
			index += ".draft";
			break;
		default:
			throw new IllegalArgumentException(type+" "+status);
		}
		return new ESPath(index, stype, id);
	}

//	/**
//	 * Pretend to be an ES server on this port.
	// Or use nginx??
//	 */
//	public int portUpload = 8284;	

}
