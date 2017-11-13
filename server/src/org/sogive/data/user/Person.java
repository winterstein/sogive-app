package org.sogive.data.user;

import java.util.Map;

import org.sogive.data.charity.Thing;

import com.winterwell.data.PersonLite;
import com.winterwell.utils.containers.Containers;
import com.winterwell.web.data.XId;

/**
 * See https://schema.org/Person
 * @author daniel
 */
public class Person extends Thing {

	private static final long serialVersionUID = 1L;

	public Person(PersonLite peepLite) {
		Map peepLiteMap = Containers.objectAsMap(peepLite);		
		putAll(peepLiteMap);
		// email?
		XId xid = peepLite.getXId();
		if (xid.isService("email")) {
			put("email", xid.name);
		}
	}
	
	public Person() {	
	}

	public String getEmail() {
		return (String) get("email");
	}

	public PersonLite getPersonLite() {
		PersonLite pl = new PersonLite(this);
		return pl;
	}

}
