package org.sogive.data.loader;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.IOException;

public class JsoupDocumentFetcherImpl implements JsoupDocumentFetcher {
    @Override
    public Document fetchDocument(String documentUrl) throws IOException {
        return Jsoup.connect(documentUrl).get();
    }
}
