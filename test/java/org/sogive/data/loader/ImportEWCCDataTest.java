package org.sogive.data.loader;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.winterwell.depot.Depot;
import com.winterwell.depot.Desc;
import com.winterwell.utils.containers.ArrayMap;

import java.io.File;

public class ImportEWCCDataTest {
	
	public static final String MAIN_FILE = "publicextract.charity.zip";	
	private static final String TAG = ImportEWCCData.class.getSimpleName();
	
	private DatabaseWriter databaseW;
	private ImportEWCCData importEWCCData;

	@Before
	public void setUp() throws Exception {
		//TODO change to test database
		databaseW = new ElasticSearchDatabaseWriter();
		importEWCCData = new ImportEWCCData(databaseW, Desc.LOCAL_SERVER);
	}

	@After
	public void tearDown() throws Exception {
		// TODO delete files in local depot?
	}
	
	//test doCreateCharity 
		//happy path charity created
	//test doCreateCharity with no name (data validation)
		//exception thrown (but which?)
	//test doUpdateCharity that previously didn't have a url & now does
		//url added
		//name not updated
	//test doUpdateCharity that previously did have a url & now doesn't
		//url not overwritten
		//name not overwritten
	//test EWCC site connection exception
		//exception thrown (but which?)
	//test EWCC property changed/not exist exception
		//custom exception thrown
	//test removed status
		//charity not added
	//test update charity with draft status
		//charity status is DRAFT after update
	
	@Test
	public void testGetAndStoreEWCCFileMainFileNotYetInDepot() {
		
		Desc<File> desc = importEWCCData.createDesc(MAIN_FILE);

		assertFalse(Depot.getDefault().contains(desc));
		
		importEWCCData.getAndStoreEWCCFile(MAIN_FILE);
		
		assertTrue(Depot.getDefault().contains(desc));
		
	}

	@Test
	public void test() {
		fail("Not yet implemented");
		
	}

}
