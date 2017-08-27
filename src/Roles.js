
import Login from 'you-again';
import DataStore from './plumbing/DataStore';
import {assMatch} from 'sjtest';

/**
 * Can the current user do this?
 * @returns {Boolean} WARNING: false if the data is loading by ajax! This will then set DataStore and trigger an update.
 */
const iCan = (capability) => {
	assMatch(capability, String);
	let roleShare = 'can:'+capability;
	let shared = DataStore.getValue(['misc', 'shares', roleShare]);
	if (shared===undefined || shared===null) {
		let req = Login.checkShare(roleShare);
		req.then(function(res) {
			let yehorneh = res.success;
			DataStore.setValue(['misc', 'shares', roleShare], yehorneh);
		});
	}
	return shared;
};

const Roles = {
	iCan
};

export default Roles;
