package org.sogive.data.loader;

import org.jsoup.nodes.Document;

import java.io.IOException;

public interface JsoupDocumentFetcher {
    Document fetchDocument(String documentUrl) throws IOException;
}
