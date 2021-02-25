package org.sogive.data.loader;

import org.sogive.data.charity.NGO;

/**
 * 
 * @author Anita
 *
 */
public interface DatabaseWriter {

    enum Status {
        PUBLISHED,
        DRAFT,
        ABSENT
    }

    void upsertCharityRecord(NGO ngo, Status status);

    /**
     * Checks if this charity is published in the database.
     * @return
     */
    Status contains(String charityId);
}
