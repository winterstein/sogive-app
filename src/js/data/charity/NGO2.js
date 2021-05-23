/** Data model functions for the NGO data-type - extends NGO.js */

import _ from 'lodash';
import $ from 'jquery';
import HashMap from 'hashmap';
import Enum from 'easy-enums';
import DataClass from '../../base/data/DataClass';
import {assert, assMatch} from 'sjtest';
import Project from './Project';
import Output from './Output';
import Money from '../../base/data/Money';
import Citation from './Citation';
import NGO from '../../base/data/NGO';
import { ellipsize, asNum } from '../../base/utils/miscutils';

/**
 * Each Charity (NGO -- which is the thing.org type) has projects.
 * "overall" is a project.
 * Each project has inputs and outputs. 
 * Each output is augmented with impact data.
 * There is a representative project -- this gives the impact that's reported.
 */

const This = NGO;
export default NGO;

/**
 * Mostly you should use #displayName()!
 */
NGO.displayName = (ngo) => ngo.displayName || ngo.name || NGO.id(ngo);
NGO.description = (ngo) => NGO.assIsa(ngo) && ngo.description;
NGO.image = (ngo) => {
	NGO.assIsa(ngo);
	return ngo.images;
};
NGO.summaryDescription = (ngo) => ngo.summaryDescription;
NGO.logo = item => item.logo; 

NGO.PROPS = new Enum('uk_giftaid');

/**
 * patch old data (boolean) and new (impact=high aka "gold")
 * Plus check for ready
 */
NGO.isHighImpact = ngo => NGO.isReady(ngo) && NGO.impact(ngo) === 'high';
/**
 * NB: handle older recommended data.
 */
NGO.impact = ngo => ngo.impact || (ngo.recommended && 'high');

/**
 * Get the summary or description, capped at 280 chars. Can be blank never null.
 */
NGO.shortDescription = ngo => ellipsize(ngo.summaryDescription || ngo.description || '', 280);
/**
 * 
 * @param {!NGO} ngo 
 * @returns array of {regulator, id, key}
 */
NGO.registrationNumbers = (ngo) => {
	// OSCR, companies house
	let regulators = [
		{regulator:'Charity Commission', key:"englandWalesCharityRegNum"},
		{regulator:'OSCR (Scotland) registration', key:"scotlandCharityRegNum"},
		{regulator:'Northern Ireland registration', key:"niCharityRegNum"},
		{regulator:'UK Companies House', key:"ukCompanyRegNum"},
		{regulator:'USA registration (e.g. EIN)', key:"usCharityRegNum"}
	];
	let regs = [];
	regulators.forEach(r => {
		if (ngo[r.key]) {
			r.id = ngo[r.key];
			regs.push(r);
		}
	});
	return regs;
};
/**
 * @return {?Project} the representative project, or null if the charity is not ready.
 */
NGO.getProject = (ngo) => {
	NGO.assIsa(ngo);
	if ( ! NGO.isReady(ngo)) {
		return null;
	}
	let projects = NGO.getProjects2(ngo);	
	// Get most recent, if more than one
	let repProject = projects.reduce((best, current) => {
		if ( ! current) return best;
		if ( ! best) return current;
		return best.year > current.year ? best : current;
	}, null);
	// console.log("getProject", repProject, "from", projects);
	return repProject;
};

NGO.isReady = (ngo) => {
	NGO.assIsa(ngo);
	if (ngo.ready) return true;
	// HACK: handle older data, where ready was per-project
	// TODO upgrade the data
	if (ngo.ready === false) return false;
	if (ngo.projects) {
		if (ngo.projects.filter(p => p.ready).length) {
			return true;
		}
	}
	return false;
};

/**
 * Prefer: representative, then overall, then any
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
	// We used to filter for ready, and never show unready. However ready/unready is now set at the charity level
	let readyProjects = projects; //.filter(p => p.ready);

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
 * @return {Money}
 */
NGO.costPerBeneficiary = ({charity, project, output}) => {
	// Is an override present? Forget calculation and just return that.
	if (output && Money.isa(output.costPerBeneficiary)) {
		return output.costPerBeneficiary;
	}
	return NGO.costPerBeneficiaryCalc({charity, project, output});
};

/**
 * @param {NGO} ngo 
 * @param {String|Number} yr 
 * @returns {Project} the overall project for year, or undefined
 */
NGO.getOverall = (ngo, yr) => {
	let overalls = ngo.projects.filter(p => Project.isOverall(p) && Project.year(p) == yr);
	return overalls[0];
};

/**
 * This ignores the override (if set)
 */
NGO.costPerBeneficiaryCalc = ({charity, project, output}) => {	
	// NB: asNum is paranoia
	let outputCount = asNum(output.number);
	if ( ! outputCount) return null;
	let projectCost = Project.getTotalCost(project);
	if ( ! projectCost) {
		console.warn("No project cost?!", project);
		return null;
	}
	// overheads?
	if ( ! Project.isOverall(project)) {
		let year = Project.year(project);
		const adjustment = NGO.getOverheadAdjustment({charity, year});
		let adjustedProjectCost = Money.mul(projectCost, adjustment);
		let v = Money.value(adjustedProjectCost);
		projectCost = adjustedProjectCost;		
	}
	Money.assIsa(projectCost);
	if ( ! $.isNumeric(outputCount)) {
		console.error("NGO.js - Not a number?! "+outputCount, "from", output);
		return 1/0; // NaN
	}
	assMatch(outputCount, Number, "NGO.js outputCount not a Number?! "+outputCount);
	let costPerOutput = new Money(projectCost);
	Money.setValue(costPerOutput, projectCost.value / outputCount);
	return costPerOutput;
};

NGO.getOverheadAdjustment = ({year, charity}) => {
	try {
		// get the overall for that year
		let overall = NGO.getOverall(charity, year);
		if ( ! overall) {
			return 1;
		}
		// get all the projects for that year
		let thatYearsProjects = charity.projects.filter(p => ! Project.isOverall(p) && Project.year(p) == year);
		// sum project costs, subtracting income
		let overallCosts = Project.getTotalCost(overall);
		// ?? how to handle project level inputs c.f. emails "Overheads calculation"
		let thatYearsProjectCosts = thatYearsProjects.map(Project.getCost);
		const totalProjectCost = Money.total(thatYearsProjectCosts);
		let adjustment = Money.divide(overallCosts, totalProjectCost);
		if ( ! isFinite(adjustment)) {
			return 1;
		}
		return adjustment;
	} catch(err) {
		console.warn("NGO.js costPerBen overheads adjustment failed ", err, charity, year);		
		return 1;
	}
};

/**
 * @returns {Citation[]} all the citations found
 */
NGO.getCitations = (charity) => {
	let refs = [];
	recurse(charity, node => {
		if (node['@type'] === 'Citation') {
			refs.push(node);
		} else if (node.source) {
			console.warn("converting to citation", node);
			refs.push(new Citation(node));
		}
	});
	refs = _.uniq(refs);
	return refs;
};

/**
 * @param fn (value, key) -> `false` if you want to stop recursing deeper down this branch. Note: falsy will not stop recursion.
 * @returns nothing -- operates via side-effects
 */
const recurse = function(obj, fn, seen) {
	if ( ! obj) return;
	if (_.isString(obj) || _.isNumber(obj) || _.isBoolean(obj)) {
		return;
	}
	// no loops
	if ( ! seen) seen = new HashMap();
	if (seen.has(obj)) return;
	seen.set(obj, true);

	let keys = Object.keys(obj);
	keys.forEach(k => {
		let v = obj[k];
		if (v===null || v===undefined) {
			return;
		}
		let ok = fn(v, k);
		if (ok !== false) {
			recurse(v, fn, seen);
		}
	});
};
