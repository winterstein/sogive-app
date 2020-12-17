package org.sogive.data.loader;

import org.sogive.data.charity.NGO;

/**
 * 
 * @author Anita
 *
 */
public interface DatabaseWriter {
    void upsertCharityRecord(NGO ngo);

    /**
     * Checks if this charity is published in the database.
     */
    boolean contains(String charityId);
}
