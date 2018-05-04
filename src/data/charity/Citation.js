import _ from 'lodash';
import {assert} from 'sjtest';
import {isa} from '../DataClass';
import {asNum} from 'wwutils';

const Citation = {};
export default Citation;

// duck type: needs URL and year
Citation.isa = (obj) => isa(obj, 'Citation') || (obj.url && asNum(obj.year));
Citation.assIsa = (obj) => assert(Citation.isa(obj));

// HACK support old data format
Citation.url = (obj) => obj.url || obj.source;

Citation.make = (base = {}) => {
	let cit = {};
	Object.assign(cit, base);
	cit['@type'] = 'Citation';
	return cit;
};
