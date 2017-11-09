package org.sogive.data.user;

import org.sogive.data.charity.Thing;

import com.winterwell.data.PersonLite;
import com.winterwell.web.data.XId;

/**
 * See https://schema.org/Person
 * @author daniel
 */
public class Person extends Thing {

	private static final long serialVersionUID = 1L;

	public String getEmail() {
		return (String) get("email");
	}

	public PersonLite getPersonLite() {
		PersonLite pl = new PersonLite(this);
		return pl;
	}

}
