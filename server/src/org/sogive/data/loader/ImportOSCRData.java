package org.sogive.data.loader;

import static com.winterwell.utils.containers.Containers.get;

import java.io.BufferedReader;
import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Future;
import java.util.zip.ZipFile;

import org.sogive.data.charity.Citation;
import org.sogive.data.charity.MonetaryAmount;
import org.sogive.data.charity.NGO;
import org.sogive.data.charity.Output;
import org.sogive.data.charity.Project;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.charity.Thing;
import org.sogive.server.CharityServlet;
import org.sogive.server.SoGiveServer;

import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.depot.Depot;
import com.winterwell.depot.Desc;
import com.winterwell.es.ESPath;
import com.winterwell.es.client.ESHttpResponse;
import com.winterwell.es.client.UpdateRequestBuilder;
import com.winterwell.maths.stats.distributions.discrete.ObjectDistribution;
import com.winterwell.utils.Dep;
import com.winterwell.utils.MathUtils;
import com.winterwell.utils.Printer;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.io.CSVReader;
import com.winterwell.utils.io.CSVSpec;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.log.KErrorPolicy;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.web.WebUtils;
import com.winterwell.web.app.AppUtils;

public class ImportOSCRData {

	public static final String OSCR_REG = "scotlandCharityRegNum";

	public static void main(String[] args) {		
		
		SoGiveServer.init();
		
		new ImportOSCRData().run();
	}

	private volatile boolean running;

	public synchronized void run() {
		running = true;
		Desc<File> desc = getDesc();
		Depot.getDefault().setErrorPolicy(KErrorPolicy.ASK);
		File file = Depot.getDefault().get(desc);
		System.out.println(file);

		BufferedReader r = FileUtils.getZIPReader(file);
		CSVReader reader = new CSVReader(r, new CSVSpec());
		int cnt = 0;
		String[] headers = reader.next(); // discard the hdeaers
		Printer.out(headers);
		for (String[] row : reader) {
			Printer.out(row);
			// 0 Charity Number, Charity Name, Registered Date, Known As, Charity Status, 
			// 5 Postcode, Constitutional Form, Previous Constitutional Form 1, Geographical Spread, Main Operating Location, 
			// 10 Purposes, Beneficiaries, Activities, Objectives, Principal Office/Trustees Address, 
			// 15 Website, Most recent year income, Most recent year expenditure, Mailing cycle, Year End, Parent charity name, 
			// Parent charity number, Parent charity country of registration, Designated religious body
			String website = row[15];
			String charityName = row[1];
			String parentName = row[19];
			String parentId = row[20];
			String active = row[4];
			boolean isActive = active.equalsIgnoreCase(active.trim());
			if ( ! isActive) {
				continue;
			}
			String ourId = NGO.idFromName(charityName);
			NGO ngo = new NGO(ourId);			
			ngo.put(NGO.name, charityName);
			ngo.put("displayName", row[3]);						
			ngo.put(OSCR_REG, row[0]);
			ngo.put(Thing.url, website);
			ngo.put("parentCharityName", row[20]);
			ngo.put("parentCharity", row[21]);
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

	private static void doCreateCharity(NGO ngo, String[] row) {
		// 0 Charity Number, Charity Name, Registered Date, Known As, Charity Status, 
		// 5 Postcode, Constitutional Form, Previous Constitutional Form 1, Geographical Spread, Main Operating Location, 
		// 10 Purposes, Beneficiaries, Activities, Objectives, Principal Office/Trustees Address, 
		// 15 Website, Most recent year income, Most recent year expenditure, Mailing cycle, Year End, 
		// Parent charity name, Parent charity number, Parent charity country of registration, Designated religious body
		
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

	public boolean isRunning() {
		return running;
	}
	
}
