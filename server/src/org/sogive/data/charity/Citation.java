package org.sogive.data.charity;

/**
 * See https://www.w3.org/community/schemabibex/wiki/Citation
 * {
            "type": [
              "http://schema.org/ScholarlyArticle"
            ],
            "properties": {
              "author": [
                {
                  "type": [
                    "http://schema.org/Person"
                  ],
                  "properties": {
                    "familyName": [
                      "Sereno"
                    ],
                    "givenName": [
                      "PD"
                    ]
                  }
                }
              ],
              "datePublished": [
                "1991"
              ],
              "name": [
                "Basal archosaurs: phylogenetic relationships and functional implications"
              ],
              "url": [
                "http://dx.doi.org/10.2307/3889336"
              ]
            }
          },
 * @author daniel
 *
 */
public class Citation extends Thing {

	public Citation(String url) {
		// should this be pointlessly nested under properties??
		put("url", url);
	}

	private static final long serialVersionUID = 1L;

}
