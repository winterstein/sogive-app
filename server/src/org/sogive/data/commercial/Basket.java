package org.sogive.data.commercial;

import java.util.List;

import org.sogive.data.charity.NGO;

import com.winterwell.data.AThing;

import lombok.Data;

@Data
public class Basket extends AThing {
	List<Ticket> items;
	
	String charity;
}
