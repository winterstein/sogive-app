package org.sogive.data.charity;

import java.io.File;

import org.sogive.data.user.Person;

import com.winterwell.data.KStatus;
import com.winterwell.data.PersonLite;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.utils.io.Option;

public class SoGiveConfig implements IESRouter {

//	public static final String charityType = "charity";
//
//	public static final String charityIndex = "charity";
//	
//	public String charityDraftIndex = "charity_draft";
//
//	public static final String donationIndex = "donation";
	
	@Option
	public int port = 8282;
	
	@Option
	public String youagainApp = "sogive";

	@Option
	public File uploadDir;

	@Override
	public ESPath getPath(String dataspaceIsIgnored, Class type, String id, Object status) {
		if (type==PersonLite.class) type = Person.class;
		String stype = type==NGO.class? "charity" : type.getSimpleName().toLowerCase();
		String index = stype;
		KStatus ks = (KStatus) status;
		if (ks==null) ks = KStatus.PUBLISHED;
		switch(ks) {
		case PUBLISHED:
			break;
		case DRAFT: case PENDING: case REQUEST_PUBLISH: case MODIFIED:
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
