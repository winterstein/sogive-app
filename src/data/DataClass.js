/**
*/

import _ from 'lodash';
import {assert} from 'sjtest';
import {endsWith} from 'wwutils';

/**
 * Coding Style??
 * 
 * These files are all about defining a convention, so let's set some rules??
 * 
 * 
 */

/**
 * check the type!
 */
const isa = function(obj, typ) {
	if (!_.isObject(obj) || obj.length) return false;
	return getType(obj) === typ;
};

/**
 * Uses schema.org or gson class to get the type.
 * Or null
 */
const getType = function(item) {
	// schema.org type?
	let type = item['@type'];
	if (type) return type;
	// Java class from FlexiGson?
	let klass = item['@class'];
	if ( ! klass) return null;
	type = klass.substr(klass.lastIndexOf('.')+1);
	return type;
};

/**
 * access functions for source, help, notes??
 */
const Meta = {};

/** {notes, source} if set
 * Never null (may create an empty map). Do NOT edit the returned value! */
// If foo is an object and bar is a primitive node, then foo.bar has meta info stored at foo.meta.bar
Meta.get = (obj, fieldName) => {
	if ( ! fieldName) {
		return obj.meta || {};
	}
	let fv = obj[fieldName];
	if (fv && fv.meta) return fv.meta;
	if (obj.meta && obj.meta[fieldName]) {
		return obj.meta[fieldName];
	}
	// nope
	return {};
};

export {isa, getType, Meta};
	
