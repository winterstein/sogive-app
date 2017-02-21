/**
*/

import _ from 'lodash';

/**
 * assert the type!
 */
const isa = function(obj, typ) {
	assert(_.isObject(obj) && ! obj.length, obj);
	if ( ! obj['@type']) return true;
	assert(obj['@type'] === typ);
	return true;
}


export {isa};
	
