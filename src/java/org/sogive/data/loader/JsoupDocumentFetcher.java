package org.sogive.data.loader;

import java.io.IOException;

import org.jsoup.nodes.Document;

public interface JsoupDocumentFetcher {
	Document fetchDocument(String documentUrl) throws IOException;
}
