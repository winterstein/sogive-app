package org.sogive.data.charity;

import java.io.File;

import org.sogive.data.user.Person;

import com.winterwell.data.KStatus;
import com.winterwell.data.PersonLite;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.utils.io.Option;
import com.winterwell.web.app.ISiteConfig;

public class SoGiveConfig implements IESRouter, ISiteConfig {

//	public static final String charityType = "charity";
//
//	public static final String charityIndex = "charity";
//	
//	public String charityDraftIndex = "charity_draft";
//
//	public static final String donationIndex = "donation";
	
	@Option
	public int port = 8282;
	
	@Override
	public int getPort() {
		return port;
	}
	
	@Option
	public String youagainApp = "sogive";

	@Option
	public File uploadDir;

	@Override
	public ESPath getPath(CharSequence dataspaceIsIgnored, Class type, CharSequence id, Object status) {
		// map personlite and person to the same DB
		if (type==PersonLite.class) type = Person.class;
		String stype = type==NGO.class? "charity" : type.getSimpleName().toLowerCase();
		String index = stype;
		KStatus ks = (KStatus) status;
		if (ks==null) ks = KStatus.PUBLISHED;
		switch(ks) {
		case PUBLISHED: 
		case ARCHIVED: // lets keep archived in the published index.
		case PUB_OR_ARC: // ...which means PUB_OR_ARC = PUB here
			break;
		case DRAFT: case PENDING: case REQUEST_PUBLISH: case MODIFIED:
			index += ".draft";
			break;
		case TRASH:
			index += ".trash";
			break;		
		case ALL_BAR_TRASH:
			String i1 = index;
			String i2 = index+".draft";
			ESPath esp = new ESPath(new String[] {i1, i2}, stype, id);
			return esp;
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
