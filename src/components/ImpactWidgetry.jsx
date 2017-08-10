import React from 'react';
import {assert, assMatch} from 'sjtest';
import _ from 'lodash';
import Enum from 'easy-enums';

import DataStore from '../plumbing/DataStore';
import printer from '../utils/printer';
import C from '../C';
import MonetaryAmount from '../data/charity/MonetaryAmount';
import NGO from '../data/charity/NGO';

import Misc from './Misc.jsx';


Misc.ImpactDesc = ({charity, project, outputs, amount}) => {
	if ( ! outputs || ! outputs.length) {
		return null;
	}
	const firstOutput = outputs[0];
	// more people?
	let cpbraw = NGO.costPerBeneficiaryCalc({charity:charity, project:project, output:firstOutput});
	if ( ! cpbraw.value) {
		return null; // Not a quantified output?
	}	
	let unitName = firstOutput.name || '';
	if ( ! amount) {
		return (
			<div className='impact'>
				<p className='impact-text'>
					<span><b><Misc.Money amount={cpbraw} precision={1} /></b></span>
					<span> will fund</span>
					<span className="impact-units-amount"> 1</span>
					<span className='impact-unit-name'> {Misc.TrPlural(1, unitName)}</span>
				</p>
			</div>
		);		
	}
	let peepText = '';
	let peeps = 1;
	if (amount / cpbraw.value < 0.75) {
		peeps = cpbraw.value / amount;
		peepText = printer.prettyNumber(peeps, 1)+' people donating ';
	}
	let impactNum = (amount / cpbraw.value) * peeps;
	// pluralise
	let plunitName = Misc.TrPlural(impactNum, unitName);	
	return (
		<div className='impact'>
			<p className='impact-text'>
				<span><b>{peepText}<Misc.Money amount={amount} /></b></span>
				<span> will fund</span>
				<span className="impact-units-amount"> {printer.prettyNumber(impactNum, 2)}</span>					
				<span className='impact-unit-name'> {plunitName}</span>
			</p>
		</div>
	);
}; //./ImpactDesc

/**
 * Copy pasta from I18N.js (aka easyi18n)
 * @param {number} num 
 * @param {String} text 
 */
Misc.TrPlural = (num, text) => {
	let isPlural = Math.round(num) !== 1;
	// Plural forms: 
	// Normal: +s, +es (eg potatoes, boxes), y->ies (eg parties), +en (e.g. oxen)
	// See http://www.englisch-hilfen.de/en/grammar/plural.htm, or https://en.wikipedia.org/wiki/English_plurals for the full horror.
	// We also cover some French, German (+e, +n) and Spanish.
	// regex matches letter(es)	
	if (isPlural===true) {
		// Get the correction from the translation
		text = text.replace(/(\w)\((s|es|en|e|n)\)/g, '$1$2');
		// Inline complex form: e.g. "child (plural: children)" or "children (sing: child)"
		// NB: The OED has pl, sing as abbreviations, c.f. http://public.oed.com/how-to-use-the-oed/abbreviations/
		text = text.replace(/(\w+)\s*\((plural|pl): ?(\w+)\)/g, '$3');
		text = text.replace(/(\w+)\s*\((singular|sing): ?(\w+)\)/g, '$1');
	} else if (isPlural===false) {
		text = text.replace(/(\w)\((s|es|en|e|n)\)/g, '$1');
		// Inline complex form
		text = text.replace(/(\w+)\s*\((plural|pl): ?(\w+)\)/g, '$1');
		text = text.replace(/(\w+)\s*\((singular|sing): ?(\w+)\)/g, '$3');
	}
	return text;
};
