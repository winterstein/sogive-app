import React from 'react';
import {assert, assMatch} from 'sjtest';
import _ from 'lodash';
import Enum from 'easy-enums';

import DataStore from '../plumbing/DataStore';
import printer from '../utils/printer';
import C from '../C';
import Money from '../data/charity/Money';
import NGO from '../data/charity/NGO';
import Project from '../data/charity/Project';
import Output from '../data/charity/Output';
import Misc from './Misc.jsx';

/**
 * @param amount {?Number} The £ to donate
 */
const ImpactDesc = ({charity, project, outputs, amount}) => {
	const impact = impactCalc({charity, project, output:outputs[0], amount});
	if (!impact) return null;

	return (
		<div className='impact'>
			<p className='impact-text'>
				<span><b><Misc.Money amount={impact.amount} /></b></span>
				<span> will fund</span>
				<span className="impact-units-amount"> {printer.prettyNumber(Output.number(impact), 2)}</span>					
				<span className='impact-unit-name'> {Output.name(impact)}</span>
			</p>
			{ Project.isOverall(project)? null : <small className='details'>{project.name}</small> }
		</div>
	);
}; //./ImpactDesc

/**
 * See Output.js for relevant doc notes
 * {
 * 	cost: {?Money} how much do you wish to donate?
 * 	targetCount: {?Number} e.g. 10 for "10 malaria nets"
 * 		Either cost or targetCount should be set, but not both.
 * }
  @returns {?Output}
 */
const impactCalc = ({charity, project, output, outputs, cost, amount, targetCount}) => {
	assert( ! outputs, "ImpactWidgetry.jsx - old code! use output not outputs");
	NGO.assIsa(charity);
	Project.assIsa(project);
	assMatch(amount, "?String");
	assMatch(targetCount, "?Number");
	assMatch(cost, "?Money");
	if ( ! output) {
		return null;
	}
	if ( ! cost && ! targetCount) {
		// specify either a spend, e.g. cost:£10, or a target scale, e.g. targetCount:10 (nets)
		return null;
	}
	// Output.assIsa(output);	can break old data :(
	
	// more people?
	let cpbraw = NGO.costPerBeneficiary({charity:charity, project:project, output:output});
	if (!cpbraw || !cpbraw.value) {
		return null; // Not a quantified output?
	}
	const unitName = Output.name(output) || '';

	// Requested a particular impact count? (ie "cost of helping 3 people")
	if (targetCount) {
		assert( ! cost, "impactCalc - cant set cost and targetCount");
		cost = Money.make({currency: cpbraw.currency, value: cpbraw.value * targetCount});
		return Output.make({cost, number: targetCount, name: Misc.TrPlural(targetCount, unitName), description: output.description });
	}

	let impactNum = Money.divide(cost, cpbraw);

	// Pluralise unit name correctly
	const plunitName = Misc.TrPlural(impactNum, unitName);

	return Output.make({number:impactNum, name:plunitName, description:output.description});
}; // ./impactCalc()

/**
 * 
 * @returns {Output[]} Filters null, so can be an empty list
 */
const multipleImpactCalc = ({charity, project, ...params}) => {
	const outputs = Project.outputs(project);
	assert( ! params.amount, "ImpactWidgetry.jsx - old code: amount - use number");
	
	return outputs.map((output) => (
		impactCalc({charity, project, output, ...params})
	)).filter(impact => !!impact);
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

export {ImpactDesc, impactCalc, multipleImpactCalc};
