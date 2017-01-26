/**
 * 
 */
package org.sogive.data;

/**
 * @author daniel
 *
 */
public class Project {

	public static void main(String[] args) {
		JsonLdSerializer serializer = new JsonLdSerializer(true /* setPrettyPrinting */);
		DataFeed object =
		    CoreFactory.newDataFeedBuilder()
		        .addJsonLdContext(
		            JsonLdFactory.newContextBuilder()
		                .setBase("http://example.com/"))
		        .addDataFeedElement(
		            CoreFactory.newRecipeBuilder()
		                .setJsonLdId("123456")
		                .addName("recipe name")
		                .addAuthor(CoreFactory.newPersonBuilder().addName("John Smith"))
		                .addIsFamilyFriendly(BooleanEnum.TRUE)
		                .setJsonLdReverse(
		                    CoreConstants.PROPERTY_RECIPE,
		                    CoreFactory.newCookActionBuilder().setJsonLdId("54321"))
		        .build();
		try {
		  String jsonLdStr = serializer.serialize(object);
		} catch (JsonLdSyntaxException e) {
		  // Errors related to JSON-LD format and schema.org terms in JSON-LD
		} catch (JsonIOException e) {
		  // Errors related to JSON format
		}
	}
}
