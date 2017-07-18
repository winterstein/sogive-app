/** Data model functions for the NGO data-type */

import _ from 'lodash';
import assert from 'sjtest';
import {isa, assIsa} from '../DataClass';

const Project = {};
export default Project;

Project.overall = 'overall';
Project.type = 'Project';


Project.isa = (ngo) => isa(ngo, Project.type);
Project.assIsa = (p) => assert(Project.isa(p));
Project.name = (ngo) => isa(ngo, Project.type) && ngo.name;
Project.year = (ngo) => isa(ngo, Project.type) && ngo.year;

Project.isOverall = (project) => assIsa(project) && project.name === Project.overall;

Project.make = function(base) {
	let proj = {
		inputs: [
			{"@type":"MonetaryAmount","name":"annualCosts","currency":"GBP"},
			// {"@type":"MonetaryAmount","name":"fundraisingCosts","currency":"GBP"},
			{"@type":"MonetaryAmount","name":"tradingCosts","currency":"GBP"},
			{"@type":"MonetaryAmount","name":"incomeFromBeneficiaries","currency":"GBP"}
		],
		outputs: [],
		impacts: []
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
