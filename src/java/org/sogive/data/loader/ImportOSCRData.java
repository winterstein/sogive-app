package org.sogive.data.loader;

import java.io.BufferedReader;
import java.io.File;

import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.charity.Thing;
import org.sogive.server.SoGiveServer;

import com.winterwell.data.KStatus;
import com.winterwell.depot.Depot;
import com.winterwell.depot.Desc;
import com.winterwell.es.ESPath;
import com.winterwell.maths.stats.distributions.discrete.ObjectDistribution;
import com.winterwell.utils.Dep;
import com.winterwell.utils.Printer;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.io.CSVReader;
import com.winterwell.utils.io.CSVSpec;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.log.KErrorPolicy;
import com.winterwell.web.ajax.JThing;
import com.winterwell.web.app.AppUtils;

/**
 * OSCR is the Scottish charity register. This can upload the _basic_ data from
 * their register into SoGive. TODO upload more of what they hold
 * 
 * @author daniel
 *
 */
public class ImportOSCRData {

	public static final String OSCR_REG = "scotlandCharityRegNum";

	private static void doCreateCharity(NGO ngo, String[] row) {
		// 0 Charity Number, Charity Name, Registered Date, Known As, Charity Status,
		// 5 Postcode, Constitutional Form, Previous Constitutional Form 1, Geographical
		// Spread, Main Operating Location,
		// 10 Purposes, Beneficiaries, Activities, Objectives, Principal Office/Trustees
		// Address,
		// 15 Website, Most recent year income, Most recent year expenditure, Mailing
		// cycle, Year End,
		// Parent charity name, Parent charity number, Parent charity country of
		// registration, Designated religious body

		ngo.put("uk_giftaid", true);

		SoGiveConfig config;
		if (Dep.has(SoGiveConfig.class)) {
			config = Dep.get(SoGiveConfig.class);
		} else {
			config = AppUtils.getConfig("sogive", new SoGiveConfig(), null);
		}

		String ourId = ngo.getId();
		if (Utils.isBlank(ourId)) {
			ourId = NGO.idFromName(ngo.getName());
			ngo.put(ngo.ID, ourId);
		}
		ESPath draftPath = config.getPath(null, NGO.class, ourId, KStatus.DRAFT);
		ESPath publishPath = config.getPath(null, NGO.class, ourId, KStatus.PUBLISHED);

		JThing item = new JThing().setJava(ngo);
		AppUtils.doSaveEdit(draftPath, item, null);
		AppUtils.doPublish(item, draftPath, publishPath);
	}

	private static Desc<File> getDesc() {
		Desc desc = new Desc("OSCR-CharityExport.csv.zip", File.class);
		desc.setServer(Desc.CENTRAL_SERVER);
		desc.setTag("sogive");
		desc.put("src", "oscr");
		desc.put("year", 2017);
		return desc;
	}

	public static void main(String[] args) {

		new SoGiveServer().init();

		new ImportOSCRData().run();
	}

	private volatile boolean running;

	public boolean isRunning() {
		return running;
	}

	public synchronized void run() {
		running = true;
		Desc<File> desc = getDesc();
		// Ask the user where the file is
		// TODO where do OSCR keep the download? Let's doc that here.
		// And maybe auto-download it.
		Depot.getDefault().setErrorPolicy(KErrorPolicy.ASK);
		File file = Depot.getDefault().get(desc);

		BufferedReader r = FileUtils.getZIPReader(file);
		CSVReader reader = new CSVReader(r, new CSVSpec());
		int cnt = 0;
		String[] headers = reader.next(); // discard the hdeaers
		Printer.out(headers);
		for (String[] row : reader) {
			Printer.out(row);
			// 0 Charity Number, Charity Name, Registered Date, Known As, Charity Status,
			// 5 Postcode, Constitutional Form, Previous Constitutional Form 1, Geographical
			// Spread, Main Operating Location,
			// 10 Purposes, Beneficiaries, Activities, Objectives, Principal Office/Trustees
			// Address,
			// 15 Website, Most recent year income, Most recent year expenditure, Mailing
			// cycle, Year End, Parent charity name,
			// Parent charity number, Parent charity country of registration, Designated
			// religious body
			String website = row[15];
			String charityName = row[1];
			String parentName = row[19];
			String parentId = row[20];
			String active = row[4];
			boolean isActive = active.equalsIgnoreCase(active.trim());
			if (!isActive) {
				continue;
			}
			String ourId = NGO.idFromName(charityName);
			
			// Build the NGO object
			// NB: filter out null values
			ArrayMap<String,String> _ngoTemp = new ArrayMap(
				NGO.name, charityName,
				"displayName", row[3],
				OSCR_REG, row[0],
				Thing.url, website,
				"parentCharityName", row[20],
				"parentCharity", row[21]
			);
			NGO ngo = new NGO(ourId);			
			for(String key : _ngoTemp.keySet()) {
				String v = _ngoTemp.get(key);
				if (Utils.isBlank(v)) continue;
				ngo.put(key, v);
			}
			
			// look for a match
			ObjectDistribution<NGO> matches = new CharityMatcher().match(ngo);
			if (matches.isEmpty()) {
				// create!
				doCreateCharity(ngo, row);
			} else {
				// TODO merge?!
			}
			cnt++;
//			if (cnt>10) break;
		}
		reader.close();
		running = false;
	}

}
