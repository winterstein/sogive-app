package org.sogive.data.loader;

import java.io.FileNotFoundException;
import java.io.FileReader;
import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.server.SoGiveServer;

import com.opencsv.CSVReader;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.maths.stats.distributions.discrete.ObjectDistribution;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;

/**
 * Updates the editorial field for charities which already exist in the SoGive database, from
 * data in CSV format: charity_id, charity_editorial (no headers)
 * 
 * @author anita
 */
public class ImportSoGiveEditorials {

	public static void main(String[] args) {
		if (args.length != 1) {
			System.err.println(
					"Must provide exactly one argument, specifying absolute file path of CSV");
			return;
		}
		new SoGiveServer().init();

		String filePath = args[0];
		System.out.println(String.format("Importing data from file: %s", filePath));
		new ImportSoGiveEditorials().run(filePath);
		System.out.println("Finished importing data.");
	}

	private volatile boolean running;

	public synchronized void run(String filePath) {
		running = true;
		CSVReader reader = null;
		try {
			reader = new CSVReader(new FileReader(filePath));
		} catch (FileNotFoundException e) {
			System.err.println(String.format(
					"Error finding CSV at path '%s': %s", filePath, e.getMessage()));
			e.printStackTrace();
		}
		CharityMatcher charityMatcher = new CharityMatcher();
		for (String[] row : reader) {
			String ourId = row[0].trim();
			NGO ngo = new NGO(ourId);

			ObjectDistribution<NGO> matches = charityMatcher.matchByIdOnly(ngo);
			if (matches.isEmpty()) {
				continue;
			}
			String editorial = row[1];
			doUpdateCharity(ngo, editorial);
		}

		running = false;
	}

	private static void doUpdateCharity(NGO ngo, String editorial) {
		ngo.put("recommendation", editorial);

		SoGiveConfig config;
		if (Dep.has(SoGiveConfig.class)) {
			config = Dep.get(SoGiveConfig.class);	
		} else {
			config = AppUtils.getConfig("sogive", new SoGiveConfig(), null);
		}

		String ourId = ngo.getId();
		assert !Utils.isBlank(ourId);

		ESPath draftPath = config.getPath(null, NGO.class, ourId, KStatus.DRAFT);
		ESPath publishPath = config.getPath(null, NGO.class, ourId, KStatus.PUBLISHED);
		
		JThing<NGO> item = new JThing<NGO>().setJava(ngo);
		AppUtils.doSaveEdit(draftPath, item, null);
		AppUtils.doPublish(item, draftPath, publishPath);
	}

	public boolean isRunning() {
		return running;
	}
	
}
