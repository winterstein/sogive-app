package org.sogive.data.loader;

import org.jsoup.nodes.Document;

import java.util.HashMap;
import java.util.Map;

class FakeJsoupDocumentFetcher implements JsoupDocumentFetcher {
    private final Map<String, Document> documents = new HashMap<>();

    public void setDocumentAtUrl(String url, Document document) {
        documents.put(url, document);
    }

    @Override
    public Document fetchDocument(String publishedGoogleDocsUrl) {
        return documents.get(publishedGoogleDocsUrl);
    }
}
