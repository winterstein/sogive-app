package org.sogive.data.loader;

import java.io.IOException;

import org.jsoup.nodes.Document;

/**
 * @deprecated Why bother with an interface here??
 */
public interface JsoupDocumentFetcher {
	Document fetchDocument(String documentUrl) throws IOException;
}
