package org.sogive.data.loader;

import org.sogive.data.charity.NGO;

public interface DatabaseWriter {
    void upsertCharityRecord(NGO ngo);
}
