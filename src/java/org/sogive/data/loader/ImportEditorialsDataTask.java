package org.sogive.data.loader;

import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import org.sogive.data.charity.NGO;

import java.io.IOException;

/**
 * Imports editorials from a given published Google Doc url.
 * Such as ??url
 * 
 * @author anita
 *
 */
public class ImportEditorialsDataTask {

	private static final String TAG = ImportEditorialsDataTask.class.getSimpleName();

	/**
	 * prevent overlapping runs
	 */
	private static volatile boolean running;

	private final EditorialsFetcher editorialsFetcher;
	private final DatabaseWriter database;

	public ImportEditorialsDataTask(JsoupDocumentFetcher jsoupDocumentFetcher, DatabaseWriter database) {
		editorialsFetcher = new EditorialsFetcher(jsoupDocumentFetcher);
		this.database = database;
	}

	public synchronized void run(String publishedGoogleDocsUrl) {
		running = true;
		try {
			Editorials editorials;
			try {
				editorials = editorialsFetcher.getEditorials(publishedGoogleDocsUrl);
			} catch (IOException e) {
				Log.e(TAG, String.format("Failed to get editorials from %s: %s", publishedGoogleDocsUrl, e.getMessage()));
				running = false;
				return;
			}
			writeEditorials(editorials);
		} catch(Throwable ex) {
			throw Utils.runtime(ex);
		} finally {
			running = false;
		}
	}

	private void writeEditorials(Editorials editorials) {
		for (Editorial editorial : editorials) {
			String charityId = editorial.getCharityId();
			// If it's not already in the charity database, we don't want to insert it.
			if (!database.contains(charityId)) {
				continue;
			}
			NGO ngo = new NGO(charityId);
			ngo.put("recommendation", editorial.getEditorialText());
			database.upsertCharityRecord(ngo);
		}
	}

	public boolean isRunning() {
		return running;
	}

}
