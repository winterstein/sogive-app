package org.sogive.data.commercial;

import org.sogive.data.user.Person;

import com.winterwell.data.AThing;

/**
 * Mostly the info is contained in {@link Event} and {@link Person},
 * but not entirely. Hence this data object
 * @author daniel
 *
 */
public class FundRaiserPage extends AThing {
	String event;
	String owner;
	String description;
}
