package org.sogive.data.loader;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.sogive.data.charity.NGO;

import com.winterwell.data.KStatus;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.log.Log;

/**
 * Imports editorials from a given published Google Doc url. Such as
 * https://docs.google.com/document/d/e/2PACX-1vTT_o-nxdI07X9CwybFQLEDEjbKvAvtEEbZPnf7XpKBMFSC4xpMa0rJYM7MwpvZqdb1O9GMuVtC7QAT/pub
 * 
 * @author anita
 *
 */
public class ImportEditorialsDataTask {

	/**
	 * prevent overlapping runs
	 */
	private static volatile boolean running;

	private static final String TAG = ImportEditorialsDataTask.class.getSimpleName();

	private final DatabaseWriter database;
	private final EditorialsFetcher editorialsFetcher;

	public ImportEditorialsDataTask(JsoupDocumentFetcher jsoupDocumentFetcher, DatabaseWriter database) {
		editorialsFetcher = new EditorialsFetcher(jsoupDocumentFetcher);
		this.database = database;
	}

	public boolean isRunning() {
		return running;
	}

	public synchronized ArrayMap run(String publishedGoogleDocsUrl) {
		running = true;
		try {
			Editorials editorials;
			try {
				editorials = editorialsFetcher.getEditorials(publishedGoogleDocsUrl);
			} catch (IOException e) {
				Log.e(TAG,
						String.format("Failed to get editorials from %s: %s", publishedGoogleDocsUrl, e.getMessage()));
				running = false;
				return new ArrayMap();
			}
			return writeEditorials(editorials);
		} catch (Throwable ex) {
			throw Utils.runtime(ex);
		} finally {
			running = false;
		}
	}

	private ArrayMap writeEditorials(Editorials editorials) {
		int count = 0;
		List<String> rejectedIds = new ArrayList<>();
		for (Editorial editorial : editorials) {
			String charityId = editorial.getCharityId();
			KStatus status = database.contains(charityId);
			// If it's not already in the charity database, we don't want to insert it.
			if (status == KStatus.ABSENT) {
				rejectedIds.add(charityId);
				continue;
			}
			NGO ngo = new NGO(charityId);
			ngo.put("recommendation", editorial.getEditorialText());
			database.updateCharityRecord(ngo, status);
			count++;
		}
		return new ArrayMap("totalImported", count, "rejectedIds", rejectedIds);
	}

}
