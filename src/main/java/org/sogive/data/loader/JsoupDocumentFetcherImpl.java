package org.sogive.data.loader;

import java.io.IOException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

public class JsoupDocumentFetcherImpl implements JsoupDocumentFetcher {
	@Override
	public Document fetchDocument(String documentUrl) throws IOException {
		return Jsoup.connect(documentUrl).get();
	}
}
