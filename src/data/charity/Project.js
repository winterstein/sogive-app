/** Data model functions for the NGO data-type */

import _ from 'lodash';
import {isa} from '../DataClass';

const Project = {};
export default Project;

Project.overall = 'overall';
Project.type = 'Project';

Project.isa = (ngo) => isa(ngo, Project.type);
Project.name = (ngo) => isa(ngo, Project.type) && ngo.name;
Project.year = (ngo) => isa(ngo, Project.type) && ngo.year;

Project.make = function(base) {
	let proj = {
		inputs: [],
		outputs: [],
		impacts: []
	};
	proj['@type'] = Project.type;
	proj = _.extend(proj, base);
	return proj;
};

Project.getLatest = (projects) => {
	if ( ! projects) return null;
	const psorted = _.sortBy(projects, Project.year);
	return psorted[psorted.length - 1];
};
