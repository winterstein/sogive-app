package org.sogive.data.loader;

import static org.junit.Assert.*;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
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
import com.winterwell.gson.JsonElement;
import com.winterwell.gson.JsonObject;
import com.winterwell.gson.JsonParser;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.web.WebEx.E404;
import com.winterwell.web.WebEx.E50X;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class ImportEWCCDataTest {
	
	private static final String EWCC_BLOB_SITE = ImportEWCCData.EWCC_BLOB_SITE;
	private static final String MAIN_FILE_NAME = ImportEWCCData.MAIN_FILE;
	private static final String EWCC_BLOB_SITE_INCORRECT = "https://notrealccewuksprdoneregsadatanotreal.blobnotreal.com";
	private static final String MAIN_FILE_NOT_EXIST = "file.not.exist.zip";
	private static final String MAIN_FILE_NOT_JSON = "txt/publicextract.charity.zip";
	
	private DatabaseWriter databaseW;
	private ImportEWCCData importEWCCData;

	@BeforeClass
	public static void setup() {
		System.out.println("--EWCC JUNIT TEST FILE RUNNING--");
		
		// NB the testStripe param (found in SoGiveTestUtils file) doesn't seem to work:
			// had to temp change prod.prop file to testStripe=true & StripeConfig file to testSecretKey="sk_test_4eC39HqLyjWDarjtT1zdp7dc" (test key from stripe site)
		String[] args = new String[] {"-port", "7312", "-testStripe", "true" };
		SoGiveServer.main(args);
	}

	@Before
	public void setUp() throws Exception {
		//TODO change to test database
		databaseW = new InMemoryDatabaseWriter();
		importEWCCData = new ImportEWCCData(databaseW, Desc.LOCAL_SERVER, 0);
	}
	
	@After
	public void tearDown() throws Exception {
		// TODO delete files in local depot?
	}
	
	String newNgoTestName = "New Charity Test";
	String newNgoTest = "[{\"charity_name\":\"New Charity Test\",\n" + 
			"		\"charity_registration_status\":\"Registered\",\n" + 
			"		\"registered_charity_number\":1,\n" + 
			"		\"charity_activities\":null,\n" + 
			"		\"charity_contact_web\":null,\n" + 
			"		\"charity_contact_email\":\"newcharity@gmail.com\",\n" + 
			"		\"charity_contact_phone\":\"+44 7911 123456\",\n" + 
			"		\"charity_gift_aid\":null}]";
	
	String updateNgoTestName = "New Charity Test";
	String updateNgoTest = "[{\"charity_name\":\"New Charity Test\",\n" + 
			"		\"charity_registration_status\":\"Registered\",\n" + 
			"		\"registered_charity_number\":1,\n" + 
			"		\"charity_activities\":\"Lots of cool things and stuff.\",\n" + 
			"		\"charity_contact_web\":\"https://www.newcharity.com\",\n" + 
			"		\"charity_contact_email\":\"updatedcharity@gmail.com\",\n" + 
			"		\"charity_contact_phone\":\"+44 7911 123456\",\n" + 
			"		\"charity_gift_aid\":null}]";
			
	String invalidNgoTest = "[{\"charity_nameee\":\"New Charity Test\",\n" + 
			"		\"charity_registration_statusss\":\"Registered\",\n" + 
			"		\"registered_charity_numberrr\":2,\n" + 
			"		\"charity_activitiesss\":\"Lots of cool things and stuff.\",\n" + 
			"		\"charity_contact_webbb\":\"https://www.newcharity.com\",\n" + 
			"		\"charity_contact_emailll\":\"updatedcharity@gmail.com\",\n" + 
			"		\"charity_contact_phoneee\":\"+44 7911 123456\",\n" + 
			"		\"charity_gift_aiddd\":null}]";
			
	String removedNgoTestName = "Removed Charity Test";
	String removedNgoTest = "[{\"charity_name\":\"Removed Charity Test\",\n" + 
			"		\"charity_registration_status\":\"Removed\",\n" + 
			"		\"registered_charity_number\":3,\n" + 
			"		\"charity_activities\":null,\n" + 
			"		\"charity_contact_web\":null,\n" + 
			"		\"charity_contact_email\":\"acharity@gmail.com\",\n" + 
			"		\"charity_contact_phone\":\"+44 7911 123457\",\n" + 
			"		\"charity_gift_aid\":null}]";
	

	@Test
	public void testGetAndStoreEWCCFileMainFile_FileNotYetInDepot() throws E404, E50X, Exception {
		
		// TODO remove from depot in tearDown()
		Desc<File> desc = importEWCCData.createDesc(MAIN_FILE_NAME);

		assertFalse(Depot.getDefault().contains(desc));
		
		importEWCCData.getAndStoreEWCCFile(EWCC_BLOB_SITE, MAIN_FILE_NAME);
		
		assertTrue(Depot.getDefault().contains(desc));
		
	}
	
	@Test(expected = com.winterwell.web.WebEx.E50X.class)
	public void testGetAndStoreEWCCFileMainFile_InvalidWebsite() throws E404, E50X, Exception {
		
		importEWCCData.getAndStoreEWCCFile(EWCC_BLOB_SITE_INCORRECT, MAIN_FILE_NAME);
		
	}
	
	@Test(expected = com.winterwell.web.WebEx.E404.class)
	public void testGetAndStoreEWCCFileMainFile_InvalidEndpoint() throws E404, E50X, Exception {
		
		importEWCCData.getAndStoreEWCCFile(EWCC_BLOB_SITE, MAIN_FILE_NOT_EXIST);
		
	}
	
	@Test
	public void testConvertJsonFileToJsonArray() throws E404, E50X, Exception {
		
		File file = importEWCCData.getAndStoreEWCCFile(EWCC_BLOB_SITE, MAIN_FILE_NAME);
		JsonArray jArray = importEWCCData.convertJsonFileToJsonArray(file);
		
		assertEquals(JsonArray.class, jArray.getClass());
		
	}
	
	@Test(expected = com.winterwell.gson.JsonSyntaxException.class)
	public void testConvertJsonFileToJsonArray_InvalidFileFormat() throws E404, E50X, Exception {
		
		File file = importEWCCData.getAndStoreEWCCFile(EWCC_BLOB_SITE, MAIN_FILE_NOT_JSON);
		JsonArray jArray = importEWCCData.convertJsonFileToJsonArray(file);
		
		assertEquals(JsonArray.class, jArray.getClass());
		
	}
	
	@Test
	public void testValidateAndResetExceptionLimit() {
		
		importEWCCData.setExceptionLimit(0);
		importEWCCData.validateAndResetExceptionLimit(100);
		assertEquals(0, importEWCCData.getExceptionLimit());
		
		importEWCCData.setExceptionLimit(3);
		importEWCCData.validateAndResetExceptionLimit(1);
		assertEquals(0, importEWCCData.getExceptionLimit());
		
		importEWCCData.setExceptionLimit(3);
		importEWCCData.validateAndResetExceptionLimit(5);
		assertEquals(0, importEWCCData.getExceptionLimit());
		
		importEWCCData.setExceptionLimit(3);
		importEWCCData.validateAndResetExceptionLimit(10);
		assertEquals(1, importEWCCData.getExceptionLimit());
		
		importEWCCData.setExceptionLimit(10);
		importEWCCData.validateAndResetExceptionLimit(20);
		assertEquals(2, importEWCCData.getExceptionLimit());

		importEWCCData.setExceptionLimit(30);
		importEWCCData.validateAndResetExceptionLimit(30);
		assertEquals(3, importEWCCData.getExceptionLimit());
		
		importEWCCData.setExceptionLimit(30);
		importEWCCData.validateAndResetExceptionLimit(40000);
		assertEquals(30, importEWCCData.getExceptionLimit());
		
		importEWCCData.setExceptionLimit(15);
		importEWCCData.validateAndResetExceptionLimit(567000);
		assertEquals(15, importEWCCData.getExceptionLimit());
		
	}
	
	@Test
	public void testProcessEWCCMainData_createCharity() throws Exception {
		
		String ourId = NGO.idFromName(newNgoTestName);
		KStatus status = databaseW.contains(ourId);
		assertEquals(KStatus.ABSENT, status);
		
		JsonArray newNgo = convertJavaToJsonArray(newNgoTest);
		assertEquals(newNgo.getClass(), JsonArray.class);
		
		importEWCCData.processEWCCMainData(newNgo);
		
		KStatus newStatus = databaseW.contains(ourId);
		assertNotEquals(KStatus.ABSENT, newStatus);
		
	}
	
	@Test
	public void testProcessEWCCMainData_updatePublishedCharity_addInfo() throws Exception {
		
		// add charity to be updated
		String ourId = NGO.idFromName(newNgoTestName);
		KStatus status = databaseW.contains(ourId);
		assertEquals(KStatus.ABSENT, status);
		JsonArray newNgo = convertJavaToJsonArray(newNgoTest);
		assertEquals(newNgo.getClass(), JsonArray.class);
		importEWCCData.processEWCCMainData(newNgo);
		KStatus newStatus = databaseW.contains(ourId);
		assertEquals(KStatus.PUBLISHED, newStatus);
		
		// update charity 
		JsonArray updateNgo = convertJavaToJsonArray(updateNgoTest);
		assertEquals(updateNgo.getClass(), JsonArray.class);
		importEWCCData.processEWCCMainData(updateNgo);
		
		//TODO with test DB: get charity & check website & updated info
		// see SoGiveTestUtils getCharity()
	}
	
	@Ignore
	@Test
	public void testProcessEWCCMainData_updatePublishedCharity_nullInfo() throws Exception {
		
		//TODO with test DB: get charity & check info was not overwritten
		// see SoGiveTestUtils getCharity()
		
	}
	
	@Ignore
	@Test
	public void testProcessEWCCMainData_updateDraftCharity() throws Exception {
		// TODO with test DB: set DRAFT status & update
	}
	
	@Test
	public void testProcessEWCCMainData_removedCharity() throws Exception {
		
		String ourId = NGO.idFromName(removedNgoTestName);
		KStatus status = databaseW.contains(ourId);
		assertEquals(KStatus.ABSENT, status);
		
		JsonArray rNgo = convertJavaToJsonArray(removedNgoTest);
		assertEquals(rNgo.getClass(), JsonArray.class);
		
		importEWCCData.processEWCCMainData(rNgo);
		
		KStatus newStatus = databaseW.contains(ourId);
		assertEquals(KStatus.ABSENT, status);
		
	}
	
	@Test(expected = com.winterwell.utils.WrappedException.class)
	public void testProcessEWCCMainData_invalidCharity() throws Exception {
		
		JsonArray ngo = convertJavaToJsonArray(invalidNgoTest);
		assertEquals(ngo.getClass(), JsonArray.class);
		
		importEWCCData.processEWCCMainData(ngo);
	}
	
	
	public JsonArray convertJavaToJsonArray(String ngoJava) {
		JsonElement jElement = new JsonParser().parse(ngoJava);
		return jElement.getAsJsonArray();
	}
	
	private static class InMemoryDatabaseWriter implements DatabaseWriter {

		private final Map<String, NGO> publishedCharityRecords;

		private final Map<String, NGO> draftCharityRecords;

		private InMemoryDatabaseWriter() {
			publishedCharityRecords = new HashMap<>();
			draftCharityRecords = new HashMap<>();
		}

		@Override
		public void updateCharityRecord(NGO ngo, KStatus status) {
			switch (status) {
			case DRAFT:
				draftCharityRecords.put(ngo.getId(), ngo);
				return;
			case PUBLISHED:
				publishedCharityRecords.put(ngo.getId(), ngo);
				return;
			default:
			}
		}

		@Override
		public KStatus contains(String charityId) {
			if (publishedCharityRecords.containsKey(charityId)) {
				return KStatus.PUBLISHED;
			}
			if (draftCharityRecords.containsKey(charityId)) {
				return KStatus.DRAFT;
			}
			return KStatus.ABSENT;
		}
		
	}


}
