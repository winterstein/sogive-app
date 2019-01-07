package org.sogive.data.charity;

import java.io.File;

import org.junit.Test;
import org.sogive.server.SoGiveServer;

public class ImportCharityDataFromCSVTest {

	@Test
	public void testImport() throws Exception{		
		new SoGiveServer().init();
		File export = new File("data/charities.csv");
		
		ImportCharityDataFromCSV importer = new ImportCharityDataFromCSV(export);
		int cnt = importer.run();
		System.out.println(cnt);
	}

}
