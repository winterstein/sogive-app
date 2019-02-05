import _ from 'lodash';
import {assert} from 'sjtest';
import DataClass from '../../base/data/DataClass';
import {asNum} from 'wwutils';

class Citation extends DataClass {
	/** duck type: needs URL and year  */
	static isa(obj) {
		return super.isa(obj, 'Citation') || (obj.url && asNum(obj.year));
	}
}
export default Citation;

// HACK support old data format
Citation.url = (obj) => obj.url || obj.source;
