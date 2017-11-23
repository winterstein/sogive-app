
import Login from 'you-again';
import DataStore from './plumbing/DataStore';
import {assMatch} from 'sjtest';
import pv from 'promise-value';

// TODO switch from storing can:x to role:x with app-defined cans

/**
 * @returns {PromiseValue<String[]>}
 */
const getRoles = () => {
	if ( ! Login.isLoggedIn()) {
		return pv([]);
	}
	let shared = DataStore.fetch(['misc', 'roles', Login.getId()],
		() => {
			let req = Login.getSharedWith({prefix:"role:*"});
			return req.then(function(res) {
				if ( ! res.success) {
					console.error(res);
					return null;
				}
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
 * Will fetch by ajax if unset.
 * 
 * Example:
 * ```
 * 	let {promise,value} = Roles.iCan('eat:sweets');
 * 	if (value) { eat sweets }
 * 	else if (value === false) { no sweets }
 * 	else { waiting on ajax }	
 * ```
 * 
 * @returns {PromiseValue<Boolean>}
 */
const iCan = (capability) => {
	assMatch(capability, String);
	let proles = getRoles();
	if (proles.value) {
		for(let i=0; i<proles.value.length; i++) {
			let cans = cans4role[proles.value[i]];
			if (cans.indexOf(capability) !== -1) return pv(true);
		}
		return pv(false);
	}
	// ajax...
	return proles.promise.then(
		res => iCan(capability)
	);
};

const cans4role = {};

const defineRole = (role, cans) => {
	assMatch(role, String);
	assMatch(cans, "String[]");
	cans4role[role] = cans;	
};

const Roles = {
	iCan,
	defineRole,
	getRoles
};

export default Roles;
