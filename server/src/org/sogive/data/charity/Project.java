/**
 * 
 */
package org.sogive.data.charity;

import java.util.HashMap;

import com.google.gson.JsonIOException;
import com.google.schemaorg.JsonLdFactory;
import com.google.schemaorg.JsonLdSerializer;
import com.google.schemaorg.JsonLdSyntaxException;
import com.google.schemaorg.core.BooleanEnum;
import com.google.schemaorg.core.CoreConstants;
import com.google.schemaorg.core.CoreFactory;
import com.google.schemaorg.core.DataFeed;
import com.google.schemaorg.core.NGO;
import com.google.schemaorg.core.NGO.Builder;

/**
 * @author daniel
 *
 */
public class Project extends Thing {

	// Does schema org have a task defined by inputs / outputs??
	
	private static final long serialVersionUID = 1L;

	public Project(String name) {
		put("name", name);
	}

	public static void main(String[] args) throws JsonIOException, JsonLdSyntaxException {
		JsonLdSerializer serializer = new JsonLdSerializer(true /* setPrettyPrinting */);
		DataFeed object =
		    CoreFactory.newDataFeedBuilder()
		        .addJsonLdContext(
		            JsonLdFactory.newContextBuilder()
		                .setBase("http://example.com/"))
//		        .addDataFeedElement(
//		            CoreFactory.newRecipeBuilder()
//		                .setJsonLdId("123456")
//		                .addName("recipe name")
//		                .addAuthor(CoreFactory.newPersonBuilder().addName("John Smith"))
//		                .addIsFamilyFriendly(BooleanEnum.TRUE)
//		                .setJsonLdReverse(
//		                    CoreConstants.PROPERTY_RECIPE,
//		                    CoreFactory.newCookActionBuilder().setJsonLdId("54321"))
		        .build();
	  String jsonLdStr = serializer.serialize(object);		
	  
	  NGO ngo = CoreFactory.newNGOBuilder()
	  .setJsonLdId("solar-aid")
	  .addLocation(CoreFactory.newPostalAddressBuilder().addAddressCountry("gb"))
	  .addUrl("https://solar-aid.org")
	  .addDescription("DOing nice stuff")
	  .addNumberOfEmployees("10")
	  .addLogo("https://solar-aid.org/wp-content/uploads/2016/10/solar-aid-default-logo.png")
	  .addImage(CoreFactory.newImageObjectBuilder().addUrl("").addDescription(""))
	  .build();
	  String jsonLdStr2 = serializer.serialize(ngo);		
	  System.out.println(jsonLdStr2);
	}

	public String getName() {
		return (String) get("name");
	}
}
