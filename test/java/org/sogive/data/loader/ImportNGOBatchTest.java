package org.sogive.data.loader;

import java.util.ArrayList;

import org.junit.Test;
import org.sogive.data.charity.NGO;

public class ImportNGOBatchTest {

	@Test
	public void TestJSONParse() {
		String json = "[\n"
				+ "	{\n"
				+ "		\"rank\": \"1\",\n"
				+ "		\"link\": \"https://www.forbes.com/companies/united-way-worldwide/?list=top-charities\",\n"
				+ "		\"name\": \"United Way Worldwide\",\n"
				+ "		\"industry\": \"Domestic Needs\",\n"
				+ "		\"revenuePrivateDonations\": \"$3.85 B\",\n"
				+ "		\"revenue\": \"$5.2 B\",\n"
				+ "		\"fundraisingEfficiency\": \"88\",\n"
				+ "		\"charitableCommitment\": \"85\",\n"
				+ "		\"description\": \"Dating back to 1887, United Way Worldwide is the nation's largest charity by donations received, much of it from payroll deductions via 1,3000 local affiliates.\",\n"
				+ "		\"domain\": \"www.unitedway.org\"\n"
				+ "	},\n"
				+ "	{\n"
				+ "		\"rank\": \"2\",\n"
				+ "		\"link\": \"https://www.forbes.com/companies/feeding-america/?list=top-charities\",\n"
				+ "		\"name\": \"Feeding America\",\n"
				+ "		\"industry\": \"Domestic Needs\",\n"
				+ "		\"revenuePrivateDonations\": \"$3.48 B\",\n"
				+ "		\"revenue\": \"$3.57 B\",\n"
				+ "		\"fundraisingEfficiency\": \"99\",\n"
				+ "		\"charitableCommitment\": \"99\",\n"
				+ "		\"description\": \"Founded in 1979, Feeding America is the nation's leading hunger-relief charity.\",\n"
				+ "		\"domain\": \"www.feedingamerica.org\"\n"
				+ "	},\n"
				+ "	{\n"
				+ "		\"rank\": \"3\",\n"
				+ "		\"link\": \"https://www.forbes.com/companies/salvation-army/?list=top-charities\",\n"
				+ "		\"name\": \"Salvation Army\",\n"
				+ "		\"industry\": \"Domestic Needs\",\n"
				+ "		\"revenuePrivateDonations\": \"$2.37 B\",\n"
				+ "		\"revenue\": \"$4.16 B\",\n"
				+ "		\"fundraisingEfficiency\": \"90\",\n"
				+ "		\"charitableCommitment\": \"82\",\n"
				+ "		\"description\": \"Founded in London in 1865, the Salvation Army is a church that is better known for its charity work in over 120 countries.\",\n"
				+ "		\"domain\": \"www.salvationarmyusa.org\"\n"
				+ "	}]";
		
		ArrayList<NGO> output = ImportNGOBatch.jsonToNGO(json);
		System.out.println(output.get(2).get("url"));
		assert output.get(2).get("url").equals("www.salvationarmyusa.org");
	}
}
