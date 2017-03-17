package org.sogive.data.charity;

import static org.junit.Assert.*;

import java.io.File;

import org.junit.Test;

import com.winterwell.gson.JsonIOException;

public class ImportCharityDataFromCSVTest {

	@Test
	public void testImport() throws Exception{		
		File export = new File("data/charities.csv");
		
		ImportCharityDataFromCSV importer = new ImportCharityDataFromCSV(export);
		int cnt = importer.run();
		System.out.println(cnt);
	}

}
