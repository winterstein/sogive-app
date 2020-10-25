package org.sogive.data.loader;

import java.util.List;
import java.util.Objects;

public class Editorial {

    private final String charityId;
    private final List<String> editorialParagraphs;

    public Editorial(String charityId, List<String> editorialParagraphs) {
        this.charityId = charityId;
        this.editorialParagraphs = editorialParagraphs;
    }

    public String getCharityId() {
        return charityId;
    }

    public String getEditorialText() {
        return String.join("\n\n", editorialParagraphs);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Editorial editorial1 = (Editorial) o;
        return Objects.equals(charityId, editorial1.charityId) &&
                Objects.equals(editorialParagraphs, editorial1.editorialParagraphs);
    }

    @Override
    public int hashCode() {
        return Objects.hash(charityId, editorialParagraphs);
    }
}
