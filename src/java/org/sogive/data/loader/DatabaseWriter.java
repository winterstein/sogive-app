package org.sogive.data.loader;

import com.winterwell.data.KStatus;
import org.sogive.data.charity.NGO;

/**
 * 
 * @author Anita
 *
 */
public interface DatabaseWriter {

    /**
     * Updates the charity's properties with the given status in the database.
     */
    void updateCharityRecord(NGO ngo, KStatus status);

    /**
     * Checks this charity's status in the database.
     *
     * @return PUBLISHED, DRAFT or ABSENT (if neither PUBLISHED or DRAFT).
     */
    KStatus contains(String charityId);
}
