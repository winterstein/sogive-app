package org.sogive.data.charity;

import java.io.File;

import com.google.common.util.concurrent.ListenableFuture;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonIOException;

import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.ESHttpResponse;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.UpdateRequestBuilder;
import com.winterwell.utils.MathUtils;
import com.winterwell.utils.Printer;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Containers;
import com.winterwell.utils.io.CSVReader;
import static com.winterwell.utils.containers.Containers.get;

// https://docs.google.com/spreadsheets/d/1Gy4sZv_WZRQzdfwVH0e3tBvyBnuEJnhSFx7_7BHLSDI/edit#gid=0

//Charity Name	Description of the column
//Classification	There's not a fixed taxonomy, but try to use the existing names and separate multiple tags with &
//Reg Num	The registration number with the Charity Commission of England & Wales
//Analyst	Add your name if you've contributed to this data collection!
//Project	This is for when a charity has multiple projects and we've split the analysis up. The Overall category is for the aggregate.
//Year start date	the official timeperiod covered by the report in question.
//Year end date	
//UK-based charity?	I.e. is gift aid availble? (so for example if it's a multinational group with a uk entity, then the answer would be yes)
//CC What	Charity Commission activity classification WHAT
//CC Who	Charity Commission activity classification WHO
//CC How	Charity Commission activity classification HOW
//CC Site	Link to the charity's page on the charity commission website. Only relevant for those which are registered with the charity commission - or if it's a registered charity in Scotland show the relevant page on the OSCR website, and similarly for the charity commission of Northern Ireland
//Source of data (typically annual report)	URL for the source
//Impact 1	number, usually listed in the prose
//Impact 2	Sometimes the accounts will refer to "indirect beneficiaries" - include those here. Alternatively include the knock-on impacts or second order impacts in this column
//Impact 3	
//Impact 4	
//Impact 5	
//Impact 6	
//Annual costs	This is the overall total costs
//Income from Char Act.	Income from Charitable Activities - should include income that's generated by activity that helps beneficiaries (e.g. selling things to beneficiaries). Accounting guidelines encourage charities to show grant funds as "income from charitable activities", so the figures labelled as "income from charitable activities" in accounts are often not what we need. Reviewing the figures by looking at the notes to the accounts often provides the level of detail needed to judge this correctly
//Fundraising costs	May be labelled as something like "costs of generating voluntary income"
//Trading costs	How much of the "cost" quoted was spent on revenue generating trading/business of the charity. Doesn't include trading where the counterparty of the trade is a beneficiary of the charity (i.e. where the trading *is* part of the charitable work) - this would be income from charitable activities instead)
//Costs minus deductions	We deduct the money spent on trading and fundraising to find the money spent on the beneficiaries. The reason for this is just simplicity: if money spent fundraising and on trading just raised itself over again, it'd be the same as if it'd just sat in the bank that year, appearing neither on the cost nor income ledgers.
//Cost per Ben 1	Cost per direct beneficiary
//Cost per Ben 2	Cost per indirect beneficiary.
//Cost per Ben 3	
//Cost per Ben 4	
//Cost per Ben 5	
//Cost per Ben 6	Cost per indirect beneficiary.
//Comments/analysis about the cost per beneficiary figure	
//Total income	For UK charities only
//Voluntary income	For UK charities only
//Reserves	
//Percent	Reserves as % of annual expenditure
//Comments	Source (ie which page number in the accounts) ; what is the target level of the reserves, and how does this compare. If you notice any risks such as underisked pension schemes or FX risk, then mention those here too
//Wording for SoGive app	
//Representative project?	Where a charity has several projects, we may have to choose one as the representative project. For really big mega-charities, it may be necessary to have the "representative" row being an aggregate or "average" of all the projects
//Is this finished/ready to use?	Is there enough data to include in the SoGive app? A judgement
//Confidence indicator	An indicator of the confidence we have in the data, especially the cost per impact
//Comments on confidence indicator	Why?
//Stories	Stories about beneficiaries (either as a link, or copied and pasted - if copied and pasted also include a source). Sometimes this is available in the annual report and accounts, but may need to look on the charity's website
//Images	A link to an image of a beneficiary. Sometimes this is available in the annual report and accounts, but may need to look on the charity's website
//Description of charity	About one sentence long
//Communications with charity	notes about if and when any emails were sent to the charity
//Where hear about?	where we heard about the charity. OK to leave this blank
//Location of intervention	what part of the world the charity interventions are
//External assessments	Links to any external assessments
//Assessment	
//Rating of impactfulness	determined in a very ad-hoc way. Not being used
//Comments about quality of intervention
/**
 * @testedby {@link ImportCharityDataFromCSVTest}
 * @author daniel
 *
 */
public class ImportCharityDataFromCSV {

	static MonetaryAmount cost(Object value) {
		if (value==null) return null;
		return new MonetaryAmount(MathUtils.getNumber(value));
	}
	
	public static void main(String[] args) throws Exception {
		File export = new File("data/charities.csv");
		
		ImportCharityDataFromCSV importer = new ImportCharityDataFromCSV(export);
		int cnt = importer.run();
		System.out.println(cnt);
	}
	
	private static final int COL_REG_NUMBER = 2;
	
	private static final int COL_DIRECTIMPACT = 14;
	private static final int COL_INDIRECTIMPACT = 15;
	
	private static final int COL_FUNDRAISINGCOSTS = 22;
	private static final int COL_ANNUALCOSTS = 20;
	private static final int COL_TOTALINCOME = 32;
	/**
	 * Income from Charitable Activities - should include income that's generated by activity that helps beneficiaries 
	 * (e.g. selling things to beneficiaries). Accounting guidelines encourage charities to show grant funds as 
	 * "income from charitable activities", so the figures labelled as "income from charitable activities" in accounts 
	 * are often not what we need. Reviewing the figures by looking at the notes to the accounts often provides the level 
	 * of detail needed to judge this correctly	£2,100,000
	 */
	private static final int COL_INCOMEFROMCHARITABLEACTIVITY = 21;
	private static final int COL_TRADINGCOSTS = 23;
	private static final int COL_RESERVES = 34;
	
	private File csv;
	private ESHttpClient client;
	private static int COL_DESC = 44;

	public ImportCharityDataFromCSV(File export) {
		this.csv = export;
		assert export.exists() : export;
	}

	public int run() throws Exception {
		init();
		CSVReader csvr = new CSVReader(csv, ',').setNumFields(-1);
		dumpFileHeader(csvr);
		Gson gson = new GsonBuilder()
				.setClassProperty("@type")
				.create();
		int cnt = 0;
		for (String[] row : csvr) {
			// the charity
			if (Utils.isBlank(row[0])) continue;
			String ourid = StrUtils.toCanonical(row[0]).replaceAll("\\s+", "-"); 
			String desc = Containers.get(row, COL_DESC);
			String regNum = Containers.get(row, COL_REG_NUMBER);
			NGO ngo = new NGO(ourid);
			ngo.put(ngo.name, row[0]);
			ngo.put("description", desc);
			ngo.put("englandWalesCharityRegNum", regNum);
			ngo.setTags(row[1]);
			
			// Should projects be separate documents??
			Project overall = new Project("overall");
			overall.put("directImpact", MathUtils.getNumber(get(row, COL_DIRECTIMPACT)));
			overall.put("indirectImpact", MathUtils.getNumber(get(row, COL_INDIRECTIMPACT)));
			overall.put("annualCosts", cost(get(row, COL_ANNUALCOSTS)));
			overall.put("fundraisingCosts", cost(get(row, COL_FUNDRAISINGCOSTS)));			
			ngo.addProject(overall);
			
			UpdateRequestBuilder pi = client.prepareUpdate(SoGiveConfig.charityIndex, "charity", ourid);
//			String json = gson.toJson(ngo);		
			pi.setDoc(ngo);
			pi.setDocAsUpsert(true);
			ListenableFuture<ESHttpResponse> f = pi.execute();
			f.get().check();
			cnt++;
		}
		return cnt;
	}

	private void init() {
		ESConfig config = new ESConfig();
		client = new ESHttpClient(config);
	}

	private void dumpFileHeader(CSVReader csvr) {
		String[] row1 = csvr.next();
		String[] row2 = csvr.next();
		String[] row3 = csvr.next();
//		String[] row4 = csvr.next();		
		for(int i=0; i<100; i++) {
			String name = Containers.get(row2, i);
			String desc = Containers.get(row3, i);
			String eg = ""; //Containers.get(row4, i);
			if (Utils.isBlank(name)) continue;
			Printer.out(i+"\t"+name+"\t"+desc+"\t"+eg);			
		}
		assert row2[COL_DESC].toLowerCase().startsWith("desc");
		assert row2[COL_REG_NUMBER].toLowerCase().startsWith("reg");
	}

	
}
