/**
*/

import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
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
 * nonce vs uid? nonce is shorter (which is nice) and it avoids -s (which upset ES searches if type!=keyword)
 * @param {*} n 
 * @returns random url-safe nonce of the requested length.
 * 
 * Let's see:
 * 60^6 ~ 50 bn
 * But the birthday paradox gives n^2 pairings, so consider n^2 for likelihood of a clash.
 * For n = 1000 items, this is safe. For n = 1m items, 6 chars isn't enough - add a timestamp to avoid the all-to-all pairings.
 */
const nonce = (n=6) => {
	const s = [];
	const az = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	for (let i = 0; i < n; i++) {
		s[i] = az.substr(Math.floor(Math.random() * az.length), 1);
	}
	return s.join("");
};

/**
 * Setup the "standard" DataClass functions.
 * @param {!String} type 
 */
const defineType = (type) => {
	assMatch(type, String);
	const This = {};
	This.type = type;
	This['@type'] = 'DataClass';
	This.isa = (obj) => isa(obj, type);
	This.assIsa = (obj, msg) => assert(This.isa(obj), (msg||'')+" "+type+" expected, but got "+obj);
	This.name = obj => obj && obj.name;
	/** convenience for getId() */
	This.id = obj => This.assIsa(obj) && getId(obj);
	This.make = (base = {}) => {
		return {
			'@type': This.type,
			...base
		};
	};
	return This;
};

export {defineType, isa, getType, getId, Meta, nonce};
	
