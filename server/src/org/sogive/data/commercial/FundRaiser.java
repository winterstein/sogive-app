package org.sogive.data.commercial;

import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.charity.NGO;
import org.sogive.data.user.Person;

import com.winterwell.data.AThing;
import com.winterwell.data.PersonLite;
import com.winterwell.web.data.XId;

import lombok.Data;

/**
 * Mostly the info is contained in {@link Event} and {@link Person},
 * but not entirely. Hence this data object
 * @author daniel
 *
 */
@Data
public class FundRaiser extends AThing {
	String event;
	XId oxid;
	PersonLite owner;
	String description;
	MonetaryAmount target;
	MonetaryAmount donated;
	Integer donationCount;
	NGO charity;
	
	public String img;
}
