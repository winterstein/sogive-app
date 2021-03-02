package org.sogive.data.loader;

import com.google.common.collect.ImmutableMap;
import com.winterwell.utils.containers.ArrayMap;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.junit.Before;
import org.junit.Test;
import org.sogive.data.charity.NGO;

import java.util.*;

import static org.junit.Assert.*;

@SuppressWarnings("SameParameterValue")
public class ImportEditorialsDataTaskTest {

    /**
     * Valid-looking published google docs url.
     */
    private static final String TEST_URL = "https://docs.google.com/document/d/e/some-random-string-jkcldsnuw/pub";
    private static final String TBD_CHARITY_ID = "tbd";
    private static final String TBD_CHARITY_EDITORIAL_TEXT =
            "tbd is a wonderful charity doing all sorts of amazing things";

    private ImportEditorialsDataTask importEditorialsDataTask;
    private InMemoryDatabaseWriter databaseWriter;
    private FakeJsoupDocumentFetcher fakeDocumentFetcher;

    @Before
    public void setUp() {
        fakeDocumentFetcher = new FakeJsoupDocumentFetcher();
        databaseWriter = new InMemoryDatabaseWriter();
        importEditorialsDataTask = new ImportEditorialsDataTask(fakeDocumentFetcher, databaseWriter);
    }

    @Test
    public void testImportEditorials_singleCharity_alreadyPublishedInDatabase() {
        databaseWriter.updateCharityRecord(new NGO(TBD_CHARITY_ID), DatabaseWriter.Status.PUBLISHED);

        fakeDocumentFetcher.setDocumentAtUrl(
                generateDocumentContainingCharityEditorials(
                        TEST_URL,
                        ImmutableMap.of(TBD_CHARITY_ID, Collections.singletonList(TBD_CHARITY_EDITORIAL_TEXT))));

        ArrayMap result = importEditorialsDataTask.run(TEST_URL);

        assertEquals(1, result.get("totalImported"));
        assertEquals(TBD_CHARITY_EDITORIAL_TEXT, databaseWriter.getCharityRecommendation(TBD_CHARITY_ID));
    }

    @Test
    public void testImportEditorials_singleCharity_alreadyInDraftInDatabase_updatesEditorialButDoesNotPublish() {
        databaseWriter.updateCharityRecord(new NGO(TBD_CHARITY_ID), DatabaseWriter.Status.DRAFT);

        fakeDocumentFetcher.setDocumentAtUrl(
                generateDocumentContainingCharityEditorials(
                        TEST_URL,
                        ImmutableMap.of(TBD_CHARITY_ID, Collections.singletonList(TBD_CHARITY_EDITORIAL_TEXT))));

        ArrayMap result = importEditorialsDataTask.run(TEST_URL);

        assertEquals(1, result.get("totalImported"));
        assertEquals(TBD_CHARITY_EDITORIAL_TEXT, databaseWriter.getCharityRecommendation(TBD_CHARITY_ID));
        assertEquals(DatabaseWriter.Status.DRAFT, databaseWriter.contains(TBD_CHARITY_ID));
    }

    @Test
    public void testImportEditorials_singleCharityPascalCase_alreadyInDatabaseAsLowercase() {
        databaseWriter.updateCharityRecord(new NGO("doctors-without-borders"), DatabaseWriter.Status.PUBLISHED);

        fakeDocumentFetcher.setDocumentAtUrl(
                generateDocumentContainingCharityEditorials(
                        TEST_URL,
                        ImmutableMap.of("Doctors-Without-Borders", Collections.singletonList("Great charity *****"))));

        importEditorialsDataTask.run(TEST_URL);

        assertEquals("Great charity *****", databaseWriter.getCharityRecommendation("doctors-without-borders"));
    }

    @Test
    public void testImportEditorials_singleCharity_notInDatabase_doesNotImport() {
        fakeDocumentFetcher.setDocumentAtUrl(
                generateDocumentContainingCharityEditorials(
                        TEST_URL,
                        ImmutableMap.of(TBD_CHARITY_ID, Collections.singletonList(TBD_CHARITY_EDITORIAL_TEXT))));

        ArrayMap result = importEditorialsDataTask.run(TEST_URL);

        assertNull(databaseWriter.getCharityRecommendation(TBD_CHARITY_ID));
        assertEquals(0, result.get("totalImported"));
        assertEquals(Arrays.asList(TBD_CHARITY_ID), result.get("rejectedIds"));
    }

    @Test
    public void testImportEditorials_singleCharity_multiParagraphEditorial_alreadyInDatabase() {
        databaseWriter.updateCharityRecord(new NGO(TBD_CHARITY_ID), DatabaseWriter.Status.PUBLISHED);
        fakeDocumentFetcher.setDocumentAtUrl(
                generateDocumentContainingCharityEditorials(
                        TEST_URL,
                        ImmutableMap.of(TBD_CHARITY_ID, Arrays.asList("first paragraph", "second paragraph"))));

        importEditorialsDataTask.run(TEST_URL);

        assertEquals("first paragraph\n\nsecond paragraph", databaseWriter.getCharityRecommendation(TBD_CHARITY_ID));
    }

    @Test
    public void testImportEditorials_singleCharity_multiParagraphEditorialContainingH2_alreadyInDatabase() {
        databaseWriter.updateCharityRecord(new NGO(TBD_CHARITY_ID), DatabaseWriter.Status.PUBLISHED);

        Document document = Document.createShell(TEST_URL);

        Element headerDiv = new Element("div");
        document.appendChild(headerDiv);

        Element contentsDiv = new Element("div");
        contentsDiv.appendChild(new Element("h1").text(TBD_CHARITY_ID));
        contentsDiv.appendChild(new Element("p").text("paragraph text"));
        contentsDiv.appendChild(new Element("p").text("second paragraph text"));
        contentsDiv.appendChild(new Element("h2").text("**Section Header**"));
        contentsDiv.appendChild(new Element("p").text("more paragraph text"));
        document.appendChild(contentsDiv);

        fakeDocumentFetcher.setDocumentAtUrl(document);

        importEditorialsDataTask.run(TEST_URL);

        assertEquals("paragraph text\n\nsecond paragraph text\n\n**Section Header**\n\nmore paragraph text",
                databaseWriter.getCharityRecommendation(TBD_CHARITY_ID));
    }

    @Test
    public void testImportEditorials_multipleCharities_alreadyInDatabase() {
        databaseWriter.updateCharityRecord(new NGO("charity-one"), DatabaseWriter.Status.PUBLISHED);
        databaseWriter.updateCharityRecord(new NGO("charity-two"), DatabaseWriter.Status.PUBLISHED);
        fakeDocumentFetcher.setDocumentAtUrl(
                generateDocumentContainingCharityEditorials(
                        TEST_URL,
                        ImmutableMap.of(
                                "charity-one", Collections.singletonList("Charity One Editorial"),
                                "charity-two", Arrays.asList("Charity Two Editorial", "Second paragraph"))));

        ArrayMap result = importEditorialsDataTask.run(TEST_URL);
        int totalImported = (int) result.get("totalImported");

        assertEquals(2, totalImported);
        assertEquals("Charity One Editorial", databaseWriter.getCharityRecommendation("charity-one"));
        assertEquals("Charity Two Editorial\n\nSecond paragraph",
                databaseWriter.getCharityRecommendation("charity-two"));
    }

    private static Document generateDocumentContainingCharityEditorials(
            String baseUri, Map<String, List<String>> charityEditorials) {
        Document document = Document.createShell(baseUri);
        // Structure below copied from a real published google doc source.

        Element headerDiv = new Element("div").attr("id", "header");
        document.appendChild(headerDiv);

        Element contentsDiv = new Element("div").attr("id", "contents");
        Element c1Div = new Element("div").addClass("c1");

        for (Map.Entry<String, List<String>> editorial : charityEditorials.entrySet()) {
            Element headerElement = new Element("h1").addClass("c3");
            headerElement.appendChild(new Element("span").addClass("c4").text(editorial.getKey()));
            c1Div.appendChild(headerElement);

            for (String paragraph : editorial.getValue()) {
                Element paragraphElement = new Element("p").addClass("c0");
                paragraphElement.appendChild(new Element("span").addClass("c2").text(paragraph));
                c1Div.appendChild(paragraphElement);

                Element emptyParagraph = new Element("p").addClass("c2");
                emptyParagraph.appendChild(new Element("span").addClass("c1"));
                c1Div.appendChild(emptyParagraph);
            }
        }
        contentsDiv.appendChild(c1Div);
        document.appendChild(contentsDiv);
        return document;
    }

    private static class InMemoryDatabaseWriter implements DatabaseWriter {

        private final Map<String, NGO> publishedCharityRecords;

        private final Map<String, NGO> draftCharityRecords;

        private InMemoryDatabaseWriter() {
            publishedCharityRecords = new HashMap<>();
            draftCharityRecords = new HashMap<>();
        }

        @Override
        public void updateCharityRecord(NGO ngo, Status status) {
            switch (status) {
                case DRAFT:
                    draftCharityRecords.put(ngo.getId(), ngo);
                    return;
                case PUBLISHED:
                    publishedCharityRecords.put(ngo.getId(), ngo);
                    return;
                default:
            }
        }

        @Override
        public Status contains(String charityId) {
            if (publishedCharityRecords.containsKey(charityId)) {
                return Status.PUBLISHED;
            }
            if (draftCharityRecords.containsKey(charityId)) {
                return Status.DRAFT;
            }
            return Status.ABSENT;
        }

        public String getCharityRecommendation(String charityId) {
            if (publishedCharityRecords.get(charityId) != null) {
                return (String) publishedCharityRecords.get(charityId).get("recommendation");
            }
            if (draftCharityRecords.get(charityId) != null) {
                return (String) draftCharityRecords.get(charityId).get("recommendation");
            }
            return null;
        }
    }
}
