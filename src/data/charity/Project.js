/** Data model functions for the NGO data-type */

import _ from 'lodash';
import {assert} from 'sjtest';
import {isa, defineType} from '../DataClass';
import MonetaryAmount from './MonetaryAmount';

const Project = defineType('Project');
const This = Project;
export default Project;

Project.overall = 'overall';

Project.name = (ngo) => ngo.name;
Project.year = (ngo) => This.assIsa(ngo, Project.type) && ngo.year;

Project.isOverall = (project) => Project.assIsa(project) && project.name && project.name.toLowerCase() === Project.overall;

/**
 * 
 @return {Output[]} never null
 */
Project.outputs = project => {
	Project.assIsa(project);
	return project.outputs || [];
};

Project.make = function(base) {
	let proj = {
		inputs: [
			{"@type":"MonetaryAmount","name":"annualCosts","currency":"GBP"},
			{"@type":"MonetaryAmount","name":"fundraisingCosts","currency":"GBP"},
			{"@type":"MonetaryAmount","name":"tradingCosts","currency":"GBP"},
			{"@type":"MonetaryAmount","name":"incomeFromBeneficiaries","currency":"GBP"}
		],
		outputs: []
	};
	proj['@type'] = Project.type;
	proj = _.extend(proj, base);
	// ensure year is the right type
	proj.year = parseInt(proj.year);
	return proj;
};

Project.getLatest = (projects) => {
	if ( ! projects) return null;
	const psorted = _.sortBy(projects, Project.year);
	return psorted[psorted.length - 1];
};

Project.getTotalCost = (project) => {
	const currency = project.inputs.reduce((curr, input) => curr || input.currency, null);
	const value = project.inputs.reduce((total, input) => {
		if (deductibleInputs.indexOf(input.name) < 0) {
			return total + (input.value || 0);
		} 
		return total - (input.value || 0);
	}, 0);
	return MonetaryAmount.make({currency, value});
};

const deductibleInputs = ['incomeFromBeneficiaries', 'fundraisingCosts', 'tradingCosts'];
