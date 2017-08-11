/** Data model functions for the NGO data-type */

import _ from 'lodash';
import {isa} from '../DataClass';
import {assert, assMatch} from 'sjtest';
import Project from './Project';
import Output from './Output';
import MonetaryAmount from './MonetaryAmount';

/**
 * Each Charity (NGO -- which is the thing.org type) has projects.
 * "overall" is a project.
 * Each project has inputs and outputs. 
 * Each output is augmented with impact data.
 * There is a representative project -- this gives the impact that's reported.
 */

const NGO = {};
export default NGO;

NGO.isa = (ngo) => isa(ngo, 'NGO');
NGO.assIsa = (ngo) => assert(NGO.isa(ngo));
NGO.name = (ngo) => isa(ngo, 'NGO') && ngo.name;
NGO.id = (ngo) => isa(ngo, 'NGO') && ngo['@id']; // thing.org id field
NGO.description = (ngo) => isa(ngo, 'NGO') && ngo.description;

/**
 * @return {Project} the representative project
 */
NGO.getProject = (ngo) => {
	NGO.isa(ngo);
	let projects = NGO.getProjects2(ngo);
	// Get most recent, if more than one
	let repProject = projects.reduce((best, current) => {
		if ( ! current) return best;
		if ( ! best) return current;
		return best.year > current.year ? best : current;
	}, null);
	return repProject;
};

/**
 * @return {Project[]}
 */
NGO.getProjects2 = (ngo) => {
	const { projects } = ngo;
	if ( ! projects) {
		// Wot no projects? Could be a new addition
		NGO.assIsa(ngo);
		return [];
	}
	assert(_.isArray(projects), ngo);
	// Filter for ready, and never show unready
	let readyProjects = projects.filter(p => p.ready);

	// Representative and ready for use?
	const repProjects = readyProjects.filter(p => p.isRep);
	if (repProjects.length) return repProjects;
	
	// ...or fall back.
	let oProjects = readyProjects.filter(p => Project.isOverall(p));
	if (oProjects.length) return oProjects;
	
	return readyProjects;
};

NGO.noPublicDonations = (ngo) => NGO.isa(ngo) && ngo.noPublicDonations;

/**
 * @return {MonetaryAmount}
 */
NGO.costPerBeneficiaryCalc = ({charity, project, output}) => {
	// Is an override present? Forget calculation and just return that.
	if (output && MonetaryAmount.assIsa(output.costPerBeneficiary)) {
		return output.costPerBeneficiary;
	}

	let outputCount = output.number;
	if ( ! outputCount) return null;
	let projectCost = Project.getTotalCost(project);
	if ( ! projectCost) {
		console.warn("No project cost?!", project);
		return null;
	}
	MonetaryAmount.assIsa(projectCost);
	assMatch(outputCount, Number);
	let costPerOutput = MonetaryAmount.make(projectCost);
	costPerOutput.value = projectCost.value / outputCount;
	costPerOutput.value100 = Math.round(100 * costPerOutput.value);
	return costPerOutput;
};
