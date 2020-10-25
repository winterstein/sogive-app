package org.sogive.data.loader;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.winterwell.utils.log.Log;

import java.io.IOException;
import java.util.*;

public class EditorialsFetcher {
    private final JsoupDocumentFetcher documentFetcher;

    public EditorialsFetcher(JsoupDocumentFetcher documentFetcher) {
        this.documentFetcher = documentFetcher;
    }

    public Editorials getEditorials(String publishedGoogleDocsUrl) throws IOException {
        Document editorialsDocument = documentFetcher.fetchDocument(publishedGoogleDocsUrl);
        return parseFromDocument(editorialsDocument);
    }

    private static Editorials parseFromDocument(Document document) {
        List<Editorial> charityEditorials = new ArrayList<>();
        Elements header1s = document.getElementsByTag("h1");
        for (Element h1 : header1s) {
            String charityId = h1.text();
            List<String> editorialParagraphs = new ArrayList<>();

            Element paragraphElement = h1.nextElementSibling();
            assert paragraphElement.tagName().equals("p");
            editorialParagraphs.add(paragraphElement.text());

            Element nextElement = paragraphElement.nextElementSibling();
            while (nextElement != null && nextElement.tagName().equals("p")) {
                String paragraphText = nextElement.text();
                if (!paragraphText.isEmpty()) {
                    editorialParagraphs.add(paragraphText);
                }
                nextElement = nextElement.nextElementSibling();
            }
            charityEditorials.add(new Editorial(charityId, editorialParagraphs));
        }
        return new Editorials(charityEditorials);
    }
}
