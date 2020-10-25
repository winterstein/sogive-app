package org.sogive.data.loader;

import com.winterwell.utils.log.Log;
import org.sogive.data.charity.NGO;
import org.sogive.server.SoGiveServer;

import java.io.IOException;

/**
 * Imports editorials from a given published Google Doc url.
 * @author anita
 *
 */
public class ImportEditorialsDataTask {

	private static final String TAG = ImportEditorialsDataTask.class.getSimpleName();

	private volatile boolean running;

	private final EditorialsFetcher editorialsFetcher;
	private final DatabaseWriter databaseWriter;

	public ImportEditorialsDataTask(JsoupDocumentFetcher jsoupDocumentFetcher, DatabaseWriter databaseWriter) {
		editorialsFetcher = new EditorialsFetcher(jsoupDocumentFetcher);
		this.databaseWriter = databaseWriter;
	}

	public synchronized void run(String publishedGoogleDocsUrl) {
		running = true;
		Editorials editorials;
		try {
			editorials = editorialsFetcher.getEditorials(publishedGoogleDocsUrl);
		} catch (IOException e) {
			Log.e(TAG, String.format("Failed to get editorials from %s: %s", publishedGoogleDocsUrl, e.getMessage()));
			running = false;
			return;
		}
		writeEditorials(editorials);
		running = false;
	}

	private void writeEditorials(Editorials editorials) {
		for (Editorial editorial : editorials) {
			String charityId = editorial.getCharityId();
			NGO ngo = new NGO(charityId);
			ngo.put("recommendation", editorial.getEditorialText());
			databaseWriter.upsertCharityRecord(ngo);
		}
	}

	public boolean isRunning() {
		return running;
	}

}
