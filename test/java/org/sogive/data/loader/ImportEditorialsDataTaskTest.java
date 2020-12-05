package org.sogive.data.loader;

import com.google.common.collect.ImmutableMap;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.junit.Before;
import org.junit.Test;
import org.sogive.data.charity.NGO;

import java.util.*;
import java.util.stream.Collectors;

import static org.junit.Assert.*;

public class ImportEditorialsDataTaskTest {

    /**
     * Valid-looking published google docs url.
     */
    private static final String VALID_URL =
            "https://docs.google.com/document/d/e/some-random-string-jkcldsnuw/pub";
    private static final String TBD_CHARITY_ID = "tbd";
    private static final String TBD_CHARITY_EDITORIAL_TEXT = "tbd is a wonderful charity doing all sorts of amazing things";

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
                VALID_URL,
                generateDocumentContainingCharityEditorials(ImmutableMap.of(
                        TBD_CHARITY_ID, Collections.singletonList(TBD_CHARITY_EDITORIAL_TEXT))));

        importEditorialsDataTask.run(VALID_URL);

        assertEquals(TBD_CHARITY_EDITORIAL_TEXT, databaseWriter.getCharityRecommendation(TBD_CHARITY_ID));
    }

    @Test
    public void testImportEditorials_singleCharity_notInDatabase_doesNotImport() {
        fakeDocumentFetcher.setDocumentAtUrl(
                VALID_URL,
                generateDocumentContainingCharityEditorials(ImmutableMap.of(
                        TBD_CHARITY_ID, Collections.singletonList(TBD_CHARITY_EDITORIAL_TEXT))));

        importEditorialsDataTask.run(VALID_URL);

        assertNull(databaseWriter.getCharityRecommendation(TBD_CHARITY_ID));
    }

    @Test
    public void testImportEditorials_singleCharity_multiParagraphEditorial_alreadyInDatabase() {
        databaseWriter.upsertCharityRecord(new NGO(TBD_CHARITY_ID));
        fakeDocumentFetcher.setDocumentAtUrl(
                VALID_URL,
                generateDocumentContainingCharityEditorials(ImmutableMap.of(
                        TBD_CHARITY_ID, Arrays.asList("first paragraph", "second paragraph"))));

        importEditorialsDataTask.run(VALID_URL);

        assertEquals("first paragraph\n\nsecond paragraph", databaseWriter.getCharityRecommendation(TBD_CHARITY_ID));
    }

    @Test
    public void testImportEditorials_singleCharity_multiParagraphEditorialContainingH2() {
        databaseWriter.upsertCharityRecord(new NGO(TBD_CHARITY_ID));

        Document document = Document.createShell(VALID_URL);

        Element headerDiv = new Element("div");
        document.appendChild(headerDiv);

        Element contentsDiv = new Element("div");
        contentsDiv.appendChild(new Element("h1").text(TBD_CHARITY_ID));
        contentsDiv.appendChild(new Element("p").text("paragraph text"));
        contentsDiv.appendChild(new Element("p").text("second paragraph text"));
        contentsDiv.appendChild(new Element("h2").text("**Section Header**"));
        contentsDiv.appendChild(new Element("p").text("more paragraph text"));
        document.appendChild(contentsDiv);

        fakeDocumentFetcher.setDocumentAtUrl(VALID_URL, document);

        importEditorialsDataTask.run(VALID_URL);

        assertEquals("paragraph text\n\nsecond paragraph text\n\n**Section Header**\n\nmore paragraph text",
                databaseWriter.getCharityRecommendation(TBD_CHARITY_ID));
    }

    @Test
    public void testImportEditorials_multipleCharities_alreadyInDatabase() {
        databaseWriter.upsertCharityRecord(new NGO("charity-one"));
        databaseWriter.upsertCharityRecord(new NGO("charity-two"));
        fakeDocumentFetcher.setDocumentAtUrl(
                VALID_URL,
                generateDocumentContainingCharityEditorials(ImmutableMap.of(
                        "charity-one", Collections.singletonList("Charity One Editorial"),
                        "charity-two", Arrays.asList("Charity Two Editorial", "Second paragraph"))));

        importEditorialsDataTask.run(VALID_URL);

        assertEquals("Charity One Editorial", databaseWriter.getCharityRecommendation("charity-one"));
        assertEquals("Charity Two Editorial\n\nSecond paragraph", databaseWriter.getCharityRecommendation("charity-two"));
    }

    private static Document generateDocumentContainingCharityEditorials(Map<String, List<String>> charityEditorials) {
        // Copied from a real published google doc source.
        StringBuilder html = new StringBuilder("<html><head></head><body><div id=\"header\"><div id=\"title\">charity test</div>" +
                "<div id=\"interval\"><span>Updated automatically every 5 minutes</span></div></div>" +
                "<div id=\"contents\"><div class=\"c1\">");
        for (Map.Entry<String, List<String>> editorial : charityEditorials.entrySet()) {
            String headerHtml =
                    "<h1 class=\"c3\" id=\"h.nqhynfkjytlx\"><span class=\"c4\">" + editorial.getKey() + "</span></h1>";
            html.append(headerHtml);
            String editorialsHtml = editorial.getValue().stream()
                    .map(paragraph -> "<p class=\"c0\"><span class=\"c2\">" + paragraph + "</span></p>")
                    .collect(Collectors.joining("<p class=\"c2\"><span class=\"c1\"></span></p>"));
            html.append(editorialsHtml);
        }
        html.append("</div></div></body></html>");
        return Jsoup.parse(html.toString());
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
