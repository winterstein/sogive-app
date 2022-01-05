package org.sogive.data.loader;

import java.io.BufferedReader;
import java.io.File;
import java.util.Scanner;

import org.sogive.server.SoGiveServer;

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
		Desc desc = new Desc("text.ccew.charities.zip", File.class);
		desc.setServer(Desc.CENTRAL_SERVER);
		desc.setTag("sogive");
		desc.put("src", "text_ccew");
		desc.put("year", 2022);
		return desc;
	}
	
	public synchronized void run() {
		System.out.println("Test ImportCCEWData run 2");
		running = true;
		
		Desc<File> desc = getDesc();
		Depot.getDefault().setErrorPolicy(KErrorPolicy.ASK);
		File file = Depot.getDefault().get(desc);
		// File file = new File("data/publicextract.charity.zip");
		System.out.println(file.getAbsolutePath());
		int cnt = 0;
		
		BufferedReader r = FileUtils.getZIPReader(file);
		
		CSVReader reader = new CSVReader(r, new CSVSpec());
		String[] headers = reader.next(); // discard the headers
		System.out.println(headers);
		for (String[] row : reader) {
			System.out.println(row);
			System.out.print(row[0]);
			cnt++;
			if (cnt>10) break;
		}
		
		/*
		Scanner reader = new Scanner(r);
		while (reader.hasNextLine() && cnt < 10) {
			String data = reader.nextLine();
			System.out.println(data);
			cnt++;
		}
		*/
		reader.close();
		running = false;
	}

	/*
	public static void main(String[] args) {
		
		new SoGiveServer().init();
		
		new ImportCCEWData().run();
	}
	*/

}
