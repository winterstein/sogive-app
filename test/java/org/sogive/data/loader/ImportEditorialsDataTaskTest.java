package org.sogive.data.loader;

import com.google.common.collect.ImmutableMap;
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
    public void testImportEditorials_singleCharity_alreadyInDatabase() {
        databaseWriter.upsertCharityRecord(new NGO(TBD_CHARITY_ID));

        fakeDocumentFetcher.setDocumentAtUrl(
                generateDocumentContainingCharityEditorials(
                        TEST_URL,
                        ImmutableMap.of(TBD_CHARITY_ID, Collections.singletonList(TBD_CHARITY_EDITORIAL_TEXT))));

        importEditorialsDataTask.run(TEST_URL);

        assertEquals(TBD_CHARITY_EDITORIAL_TEXT, databaseWriter.getCharityRecommendation(TBD_CHARITY_ID));
    }

    @Test
    public void testImportEditorials_singleCharityPascalCase_alreadyInDatabaseAsLowercase() {
        databaseWriter.upsertCharityRecord(new NGO("doctors-without-borders"));

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

        importEditorialsDataTask.run(TEST_URL);

        assertNull(databaseWriter.getCharityRecommendation(TBD_CHARITY_ID));
    }

    @Test
    public void testImportEditorials_singleCharity_multiParagraphEditorial_alreadyInDatabase() {
        databaseWriter.upsertCharityRecord(new NGO(TBD_CHARITY_ID));
        fakeDocumentFetcher.setDocumentAtUrl(
                generateDocumentContainingCharityEditorials(
                        TEST_URL,
                        ImmutableMap.of(TBD_CHARITY_ID, Arrays.asList("first paragraph", "second paragraph"))));

        importEditorialsDataTask.run(TEST_URL);

        assertEquals("first paragraph\n\nsecond paragraph", databaseWriter.getCharityRecommendation(TBD_CHARITY_ID));
    }

    @Test
    public void testImportEditorials_singleCharity_multiParagraphEditorialContainingH2_alreadyInDatabase() {
        databaseWriter.upsertCharityRecord(new NGO(TBD_CHARITY_ID));

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
        databaseWriter.upsertCharityRecord(new NGO("charity-one"));
        databaseWriter.upsertCharityRecord(new NGO("charity-two"));
        fakeDocumentFetcher.setDocumentAtUrl(
                generateDocumentContainingCharityEditorials(
                        TEST_URL,
                        ImmutableMap.of(
                                "charity-one", Collections.singletonList("Charity One Editorial"),
                                "charity-two", Arrays.asList("Charity Two Editorial", "Second paragraph"))));

        importEditorialsDataTask.run(TEST_URL);

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

        private final Map<String, NGO> charityRecords;

        private InMemoryDatabaseWriter() {
            charityRecords = new HashMap<>();
        }

        @Override
        public void upsertCharityRecord(NGO ngo) {
            charityRecords.put(ngo.getId(), ngo);
        }

        @Override
        public boolean contains(String charityId) {
            return charityRecords.containsKey(charityId);
        }

        public String getCharityRecommendation(String charityId) {
            if (charityRecords.get(charityId) == null) {
                return null;
            }
            return (String) charityRecords.get(charityId).get("recommendation");
        }
    }
}
