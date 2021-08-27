package org.sogive.data.loader;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

/**
 * Fetch data from a Google Doc Assumes format: h1: charity ID editorial text
 * (which can be across a few paragraphs)
 * 
 * @author Anita
 *
 */
public class EditorialsFetcher {
	private static Editorials parseFromDocument(Document document) {
		List<Editorial> charityEditorials = new ArrayList<>();
		Elements header1s = document.getElementsByTag("h1");
		for (Element h1 : header1s) {
			String charityId = h1.text().trim().toLowerCase();
			List<String> editorialParagraphs = new ArrayList<>();

			Element firstParagraphElement = h1.nextElementSibling();
			editorialParagraphs.add(firstParagraphElement.text());

			Element nextElement = firstParagraphElement.nextElementSibling();
			while (nextElement != null && !nextElement.tagName().equals("h1")) {
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

	private final JsoupDocumentFetcher documentFetcher;

	public EditorialsFetcher(JsoupDocumentFetcher documentFetcher) {
		this.documentFetcher = documentFetcher;
	}

	public Editorials getEditorials(String publishedGoogleDocsUrl) throws IOException {
		Document editorialsDocument = documentFetcher.fetchDocument(publishedGoogleDocsUrl);
		return parseFromDocument(editorialsDocument);
	}
}
