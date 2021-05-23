import _ from 'lodash';
import DataClass from '../../base/data/DataClass';
import { asNum } from '../../base/utils/miscutils';

class Citation extends DataClass {
	/** duck type: needs URL and year  */
	static isa(obj) {
		return super.isa(obj, 'Citation') || (obj.url && asNum(obj.year));
	}
	
	constructor(base) {
		super(base);
		Object.assign(this, base);
	}
}
DataClass.register(Citation, "Citation");
export default Citation;

// HACK support old data format
Citation.url = (obj) => obj.url || obj.source;
