package org.sogive.data.charity;

public class MonetaryAmount extends Thing {
	private static final long serialVersionUID = 1L;


	public MonetaryAmount(double value) {
		// ISO 4217 £
		put("currency", "GBP");
		put("value", value);		
	}
	
}
