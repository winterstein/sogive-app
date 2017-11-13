/**
 * 
 */
package org.sogive.data.commercial;

import java.util.List;
import java.util.Map;

import com.winterwell.data.AThing;

/**
 * @author daniel
 *
 */
public class Event extends AThing {
	
	List<Ticket> ticketTypes;
	String date;
	Integer matchedFunding;
	String logoImage;
	String bannerImage;
	String description;
	String backgroundImage;
}
