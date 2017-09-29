import React from 'react';
import {assert, assMatch} from 'sjtest';
import _ from 'lodash';
import Enum from 'easy-enums';

import DataStore from '../plumbing/DataStore';
import printer from '../utils/printer';
import C from '../C';
import MonetaryAmount from '../data/charity/MonetaryAmount';
import NGO from '../data/charity/NGO';
import Project from '../data/charity/Project';

import Misc from './Misc.jsx';

/**
 * @param amount {?Number} The £ to donate
 */
const ImpactDesc = ({charity, project, outputs, amount}) => {
	const impact = impactCalc({charity, project, outputs, amount});
	if (!impact) return null;

	return (
		<div className='impact'>
			<p className='impact-text'>
				<span><b>{impact.prefix}<Misc.Money amount={impact.amount} /></b></span>
				<span> will fund</span>
				<span className="impact-units-amount"> {printer.prettyNumber(impact.impactNum, 2)}</span>					
				<span className='impact-unit-name'> {impact.unitName}</span>
			</p>
			{ Project.isOverall(project)? null : <small className='details'>{project.name}</small> }
		</div>
	);
}; //./ImpactDesc

const impactCalc = ({charity, project, outputs, amount, targetCount}) => {
	if ( ! outputs || ! outputs.length) {
		return null;
	}
	const firstOutput = outputs[0];
	// more people?
	let cpbraw = NGO.costPerBeneficiary({charity:charity, project:project, output:firstOutput});
	if (!cpbraw || !cpbraw.value) {
		return null; // Not a quantified output?
	}
	const unitName = firstOutput.name || '';

	// Requested a particular impact count? (ie "cost of helping 3 people")
	if (targetCount) {
		const cost = MonetaryAmount.make({currency: cpbraw.currency, value: cpbraw.value * targetCount});
		return { prefix: '', amount: cost, impactNum: targetCount, unitName: Misc.TrPlural(targetCount, unitName), description: firstOutput.description };
	}

	// No amount? Just show unit cost, then.
	if (!amount) {
		return { prefix: '', amount: cpbraw, impactNum: 1, unitName: Misc.TrPlural(1, unitName), description: firstOutput.description };
	}

	let prefix = '';
	let people = 1;
	if (amount / cpbraw.value < 0.75) {
		people = cpbraw.value / amount;
		prefix = printer.prettyNumber(people, 1) + ' people donating ';
	}
	let impactNum = (amount / cpbraw.value) * people;

	// Pluralise unit name correctly
	const plunitName = Misc.TrPlural(impactNum, unitName);

	return { prefix, amount, impactNum, unitName: plunitName, description: firstOutput.description};
};


/**
 * Copy pasta from I18N.js (aka easyi18n)
 * @param {number} num 
 * @param {String} text Can be undefined (returns undefined)
 */
Misc.TrPlural = (num, text) => {
	if ( ! text) return text;
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

export {ImpactDesc, impactCalc};
