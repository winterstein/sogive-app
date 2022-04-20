package org.sogive.data.loader;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.charity.Thing;
import org.sogive.server.SoGiveServer;

import com.winterwell.data.KStatus;
import com.winterwell.depot.Depot;
import com.winterwell.depot.Desc;
import com.winterwell.gson.JsonArray;
import com.winterwell.gson.JsonObject;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;

import java.io.File;

public class ImportEWCCDataTest {
	
	//public static final String EWCC_BLOB_ENDPOINT = "https://ccewuksprdoneregsadata1.blob.core.windows.net/data/json";
	private static final String EWCC_BLOB_ENDPOINT_INCORRECT = "https://website.not.exist";
	//public static final String MAIN_FILE = "publicextract.charity.zip";
	private static final String MAIN_FILE_INCORRECT = "file.not.exist.zip";
	private static final String TAG = ImportEWCCData.class.getSimpleName();
	
	private static final String EWCC_BLOB_ENDPOINT = ImportEWCCData.EWCC_BLOB_ENDPOINT;
	private static final String MAIN_FILE_NAME = ImportEWCCData.MAIN_FILE;
	
	private DatabaseWriter databaseW;
	private ImportEWCCData importEWCCData;
	static SoGiveServer server;


	@Before
	public void setUp() throws Exception {
		//TODO change to test database
		String[] args = new String[] {"-port", "7312", "testStripe", "true" };
		SoGiveServer.main(args);

		databaseW = new ElasticSearchDatabaseWriter();
		importEWCCData = new ImportEWCCData(databaseW, Desc.LOCAL_SERVER);
		
		/*
		// in-memory server for testing
		if (server == null) {
			server = new SoGiveServer();
			String[] args = new String[] { "-port", "7312", "-test", "true" };
			server.doMain(args);
		}
		SoGiveConfig config = server.getConfig();
		*/
		System.out.println("!!!!!!!!!TEST FILE EWCC RUNNING!!!!!!!!!");
	}
	
	@After
	public void tearDown() throws Exception {
		// TODO delete files in local depot?
	}
	
	
	ArrayMap<String,String> newNgoTest = new ArrayMap(
		"charity_name", "New Charity Test",
		"charity_registration_status", "Registered",
		"registered_charity_number", "1",
		"charity_activities", null,
		"charity_contact_web", null,
		"charity_contact_email", "newcharity@gmail.com",
		"charity_contact_phone", "+44 7911 123456",
		"charity_gift_aid", null
	);
	
	ArrayMap<String,String> updateNgoTest = new ArrayMap(
			"charity_name", "New Charity Test",
			"charity_registration_status", "Registered",
			"registered_charity_number", "1",
			"charity_activities", "Lots of cool things and stuff.",
			"charity_contact_web", "https://www.newcharity.com",
			"charity_contact_email", "updatedcharity@gmail.com",
			"charity_contact_phone", "+44 7911 123456",
			"charity_gift_aid", null
	);
	
	ArrayMap<String,String> removedNgoTest = new ArrayMap(
		"registered_charity_number", "Test Name 1",
		"displayName", "Test Name 1",
		"englandWalesCharityRegNum", "121212"
	);
	
	ArrayMap<String,String> invalidPropertiesNgoTest = new ArrayMap(
		"registered_charity_number", "Test Name 1",
		"displayName", "Test Name 1",
		"englandWalesCharityRegNum", "121212"
	);
	
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
	//test charity error exception limit hit
		//exception thrown (but which?)
	//test EWCC property changed/not exist exception
		//custom exception thrown
	//test removed status
		//charity not added
	//test update charity with draft status
		//charity status is DRAFT after update
	
	
	@Test
	public void testGetAndStoreEWCCFileMainFile_FileNotYetInDepot() {
		
		// TODO remove from depot or change depotServer
		Desc<File> desc = importEWCCData.createDesc(MAIN_FILE_NAME);

		assertFalse(Depot.getDefault().contains(desc));
		
		importEWCCData.getAndStoreEWCCFile(EWCC_BLOB_ENDPOINT, MAIN_FILE_NAME);
		
		assertTrue(Depot.getDefault().contains(desc));
		
	}
	
	@Ignore
	@Test(expected = com.winterwell.web.WebEx.E50X.class)
	public void testGetAndStoreEWCCFileMainFile_InvalidWebsite() {
		
		importEWCCData.getAndStoreEWCCFile(EWCC_BLOB_ENDPOINT_INCORRECT, MAIN_FILE_NAME);
		
	}
	
	@Ignore
	@Test(expected = com.winterwell.web.WebEx.E404.class)
	public void testGetAndStoreEWCCFileMainFile_InvalidFile() {
		
		importEWCCData.getAndStoreEWCCFile(EWCC_BLOB_ENDPOINT, MAIN_FILE_INCORRECT);
		
	}
	
	@Ignore
	@Test
	public void testConvertJsonFileToJsonArray() {
		
		File file = importEWCCData.getAndStoreEWCCFile(EWCC_BLOB_ENDPOINT, MAIN_FILE_NAME);
		JsonArray jArray = importEWCCData.convertJsonFileToJsonArray(file);
		
		assertEquals(jArray.getClass(), JsonArray.class);
		
	}
	
	@Test
	public void testProcessEWCCMainData_createCharity() throws Exception {
		
		String cName = newNgoTest.get("charity_name");
		String ourId = NGO.idFromName(cName);
		KStatus status = databaseW.contains(ourId);
		assertEquals(status, KStatus.ABSENT);
		
		JsonArray newNgo = convertJavaToJsonArray(newNgoTest);
		assertEquals(newNgo.getClass(), JsonArray.class);
		
		importEWCCData.processEWCCMainData(newNgo);
		
		KStatus newStatus = databaseW.contains(ourId);
		assertNotEquals(status, KStatus.ABSENT);
		
	}
	
	public JsonArray convertJavaToJsonArray(ArrayMap<String, String> ngoJava) {
		
		JsonArray testData = new JsonArray();
		
		for(String key : ngoJava.keySet()) {
			JsonObject prop = new JsonObject();
			prop.addProperty(key, ngoJava.get(key));
			testData.add(prop);
		}
		System.out.println(testData.toString());
		return testData;
		
	}


}
