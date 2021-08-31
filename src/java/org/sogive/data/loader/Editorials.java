package org.sogive.data.loader;

import java.util.Arrays;
import java.util.Collection;
import java.util.Iterator;

/**
 * @deprecated Why not use a plain-old List??
 */
public class Editorials implements Iterable<Editorial> {
	private final Collection<Editorial> charityEditorials;

	public Editorials(Collection<Editorial> charityEditorials) {
		this.charityEditorials = charityEditorials;
	}

	public Editorials(Editorial... charityEditorials) {
		this.charityEditorials = Arrays.asList(charityEditorials.clone());
	}

	public String getEditorial(String charityId) {
		return charityEditorials.stream().filter(editorial -> editorial.getCharityId().equals(charityId)).findFirst()
				.map(Editorial::getEditorialText).orElse(null);
	}

	@Override
	public Iterator<Editorial> iterator() {
		return charityEditorials.iterator();
	}
}
