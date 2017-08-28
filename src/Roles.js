
import Login from 'you-again';
import DataStore from './plumbing/DataStore';
import {assMatch} from 'sjtest';
import C from './C';

// TODO switch from storing can:x to role:x with app-defined cans

/**
 * @returns {PromiseValue<String[]>}
 */
const getRoles = () => {
	let shared = DataStore.fetch(['misc', 'roles', Login.getId()],
		() => {
			let req = Login.getSharedWith({prefix:"role:*"});
			return req.then(function(res) {
				let shares = res.cargo;
				let roles = shares.filter(s => s.item && s.item.substr(0,5)==='role:').map(s => s.item.substr(5));
				return roles;
			});
		}
	);
	return shared;
};

/**
 * Can the current user do this?
 * @returns {Boolean} WARNING: false if the data is loading by ajax! This will then set DataStore and trigger an update.
 */
const iCan = (capability) => {
	assMatch(capability, String);
	let proles = getRoles();
	if ( ! proles.value) return null;
	for(let i=0; i<proles.value.length; i++) {
		let cans = cans4role[proles.value[i]];
		if (cans.indexOf(capability) !== -1) return true;
	}
	return false;
};

const cans4role = {};

const define = (role, cans) => {
	assMatch(role, String);
	assMatch(cans, "String[]");
	cans4role[role] = cans;	
};

const Roles = {
	iCan,
	define,
	getRoles
};

export default Roles;

// setup roles
define(C.ROLES.editor, [C.CAN.publish]);
define(C.ROLES.admin, C.CAN.values);
