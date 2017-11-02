package org.sogive.data.commercial;

import org.sogive.data.charity.MonetaryAmount;

import com.winterwell.data.AThing;

public class Product extends AThing {

	MonetaryAmount price;

	@Override
	public String toString() {
		return "Product[price=" + price + ", name=" + name + ", id=" + id + "]";
	}
	
	
}
