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
 * Prefers a plain .id but also supports schema.org @id.
 * null returns null
 */
const getId = (item) => {
	if ( ! item) return null;
	if (item.id && item['@id'] && item.id !== item['@id']) {
		console.warn("conflicting id/@id item ids "+item.id+" vs "+item['@id'], item);
	}
	return item.id || item['@id'];
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

/**
 * 
 * @param {*} n 
 * @returns random url-safe nonce of the requested length.
 */
const nonce = (n=6) => {
	const s = [];
	const az = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	for (let i = 0; i < n; i++) {
		s[i] = az.substr(Math.floor(Math.random() * az.length), 1);
	}
	return s.join("");
};

export {isa, getType, getId, Meta, nonce};
	
