/** Data model functions for the NGO data-type */

import _ from 'lodash';
import {isa} from '../DataClass';

const Project = {};
export default Project;


Project.isa = (ngo) => isa(ngo, 'Project');
Project.name = (ngo) => isa(ngo, 'Project') && ngo.name;
Project.year = (ngo) => isa(ngo, 'Project') && ngo.year;

Project.getLatest = (projects) => {
	if ( ! projects) return null;
	const psorted = _.sortBy(projects, Project.year);
	return psorted[psorted.length - 1];
};