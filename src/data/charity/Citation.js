import _ from 'lodash';
import {assert} from 'sjtest';
import {isa} from '../../base/data/DataClass';

const Citation = {};
export default Citation;

// duck type: needs URL and year
Citation.isa = (obj) => isa(obj, 'Citation') || (obj.url && _.isNumber(obj.year));
Citation.assIsa = (obj) => assert(Citation.isa(obj));

Citation.make = (base = {}) => {
	let cit = {};
	Object.assign(cit, base);
	cit['@type'] = 'Citation';
	return cit;
};
