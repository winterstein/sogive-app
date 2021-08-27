package org.sogive.data.loader;

import org.sogive.data.charity.NGO;

import com.winterwell.data.KStatus;

/**
 * 
 * @author Anita
 *
 */
public interface DatabaseWriter {

	/**
	 * Checks this charity's status in the database.
	 *
	 * @return PUBLISHED, DRAFT or ABSENT (if neither PUBLISHED or DRAFT).
	 */
	KStatus contains(String charityId);

	/**
	 * Updates the charity's properties with the given status in the database.
	 */
	void updateCharityRecord(NGO ngo, KStatus status);
}
