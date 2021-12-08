package org.sogive.data.loader;

import java.io.BufferedReader;
import java.io.File;

import com.winterwell.depot.Depot;
import com.winterwell.depot.Desc;
import com.winterwell.utils.Printer;
import com.winterwell.utils.io.CSVReader;
import com.winterwell.utils.io.CSVSpec;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.log.KErrorPolicy;

/**
 * Charity Commission for England & Wales. This can upload the _basic_ data from
 * their register into SoGive. TODO upload more of what they hold
 * 
 * @author sarah
 *
 */
public class ImportCCEWData {

	public static final String CCEW_REG = "englandWalesCharityRegNum";
	
	private volatile boolean running;

	public boolean isRunning() {
		return running;
	}

	// not used
	private static Desc<File> getDesc() {
		Desc desc = new Desc("publicextract.charity.zip", File.class);
		desc.setServer(Desc.CENTRAL_SERVER);
		desc.setTag("sogive");
		desc.put("src", "ccew");
		desc.put("year", 2021);
		return desc;
	}
	
	public synchronized void run() {
		
		/*
		running = true;
		Desc<File> desc = getDesc();
		Depot.getDefault().setErrorPolicy(KErrorPolicy.ASK);
		File file = Depot.getDefault().get(desc);
		*/

		BufferedReader r = FileUtils.getZIPReader(file);
		CSVReader reader = new CSVReader(r, new CSVSpec());
		int cnt = 0;
		String[] headers = reader.next(); // discard the headers
		Printer.out(headers);
		
		for (String[] row : reader) {
			Printer.out(row);
			cnt++;
			if (cnt>10) break;
		}
		
		reader.close();
		running = false;
	}
	
	public static void main(String[] args) {
		
		new ImportCCEWData().run();

	}

}
