import {assert} from 'sjtest';
import DataClass from '../../base/data/DataClass';
import C from '../../C';

/** impact utils */
class Event extends DataClass {
	constructor(base) {
		super(base);
		Object.assign(this, base);
	}

}
DataClass.register(Event);
export default Event;

Event.date = e => e && e.date;
