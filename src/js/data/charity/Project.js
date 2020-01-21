/** Data model functions for the NGO data-type */

import _ from 'lodash';
import {assert} from 'sjtest';
import DataClass from '../../base/data/DataClass';
import Money from '../../base/data/Money';

class Project extends DataClass {

	inputs = [
		{"@type":"Money","name":"annualCosts","currency":"GBP"},
		{"@type":"Money","name":"fundraisingCosts","currency":"GBP"},
		{"@type":"Money","name":"tradingCosts","currency":"GBP"},
		{"@type":"Money","name":"incomeFromBeneficiaries","currency":"GBP"}
	];
	outputs = []; //default

	constructor(base) {
		super(base);
		Object.assign(this, base);
		// ensure year is the right type
		if (this.year) {
			this.year = parseInt(this.year);
		}
	}
}
DataClass.register(Project, "Project");
const This = Project;
export default Project;

Project.overall = 'overall';

Project.year = (ngo) => This.assIsa(ngo, Project.type) && ngo.year;

Project.isOverall = (project) => Project.assIsa(project) && project.name && project.name.toLowerCase() === Project.overall;

/**
 * 
 @return {Output[]} never null, can be empty
 */
Project.outputs = project => {
	Project.assIsa(project);	
	Project.safeList(project, 'outputs');
	return project.outputs;
};
/** 
 * @return {Money[]} never null, can be empty
 */
Project.inputs = project => {
	Project.checkIsa(project);
	Project.safeList(project, 'inputs');
	return project.inputs;
};

Project.getLatest = (projects) => {
	if ( ! projects) return null;
	const psorted = _.sortBy(projects, Project.year);
	return psorted[psorted.length - 1];
};

/**
 * Find the projectCosts or annualCosts input
 * @returns {Money}
 */
Project.getCost = (project) => {
	Project.assIsa(project);
	let inputs = Project.inputs(project);
	let costs = inputs.filter(input => input.name==='projectCosts' || input.name==='annualCosts');
	return costs[0]; // can be null
};

/**
 * Actually, this is "get the total cost minus certain categories, so its more like total costs covered by donations"
 */
Project.getTotalCost = (project) => {
	// total - but some inputs are actually negatives
	const currency = project.inputs.reduce((curr, input) => curr || input.currency, null);
	const value = project.inputs.reduce((total, input) => {
		if (deductibleInputs.indexOf(input.name) !== -1) {
			// These count against the total
			// NB: Use abs in case an overly smart editor put them in as -ives
			return total - Math.abs(input.value || 0);
		}
		return total + (Money.value(input) || 0); // normal
	}, 0);
	return new Money({currency, value});
};

const deductibleInputs = ['incomeFromBeneficiaries', 'fundraisingCosts', 'tradingCosts'];
