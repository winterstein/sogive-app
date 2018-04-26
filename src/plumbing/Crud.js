/** Add "standard crud functions" to ServerIO and ActionMan 
 * 
 * 
 * Architecture and Assumptions
 * 
 * Items are stored in DataStore in two places:
 * 
 * The published version: data.type.id
 * The draft version: DRAFT.type.id
 * 
 * Either of which may be blank.
 * 
 * 
*/


import _ from 'lodash';
import $ from 'jquery';
import {SJTest, assert, assMatch} from 'sjtest';
import C from '../C.js';
import xDataStore from './DataStore';
import {getId, getType} from '../data/DataClass';
import Login from 'you-again';
import {XId, encURI} from 'wwutils';

import ServerIO from './ServerIO';
import ActionMan from './ActionMan';
import {notifyUser} from './Messaging';

/**
 * @returns Promise
 */
ActionMan.crud = (type, id, action, item) => {
	if ( ! type) type = getType(item);
	if ( ! id) id = getId(item);
	assMatch(id, String);
	assert(C.TYPES.has(type), type);
	assert(C.CRUDACTION.has(action), type);
	if ( ! item) {
		// we normally operate on the draft
		item = DataStore.getData(type, id, C.KStatus.DRAFT);
		if ( ! item) item = DataStore.getData(type, id);
	}
	if ( ! item) {
		// No item? fine for action=delete. Make a transient dummy here
		assert(action==='delete', action+" "+type+" "+id);
		item = {id, "@type": type};
	}
	if ( ! getId(item)) {
		assert(id==='new', id);
		item.id = id;
	}
	// new item? then change the action
	if (id===C.newId && action==='save') {
		action = 'new';
	}
	// mark the widget as saving
	DataStore.setLocalEditsStatus(type, id, C.STATUS.saving);
	// call the server
	return ServerIO.crud(type, item, action)
		.then(DataStore.updateFromServer.bind(DataStore))
		.then((res) => {
			// success :)
			const navtype = (C.navParam4type? C.navParam4type[type] : null) || type;
			if (action==='delete') {
				DataStore.setUrlValue(navtype, null);
			} else if (id===C.newId) {
				// id change!
				// updateFromServer should have stored the new item
				// So just repoint the focus
				let serverId = getId(res.cargo);
				DataStore.setFocus(type, serverId); // deprecated			
				DataStore.setUrlValue(navtype, serverId);
			}
			// clear the saving flag
			DataStore.setLocalEditsStatus(type, id, C.STATUS.clean);
			return res;
		},
		// fail?
		(err) => {
			// bleurgh
			console.warn(err);
			// TODO factor out message code
			notifyUser(new Error(action+" failed: "+(err && err.responseText)));
			// mark the object as dirty
			DataStore.setLocalEditsStatus(type, id, C.STATUS.dirty);
			return err;
		});
}; // ./crud

ActionMan.saveEdits = (type, pubId, item) => {
	return ActionMan.crud(type, pubId, 'save', item);
};

ActionMan.publishEdits = (type, pubId, item) => {	
	return ActionMan.crud(type, pubId, 'publish', item)
		.then(res => {
			// invalidate any cached list of this type
			DataStore.invalidateList(type);
			return res;
		}); // ./then	
};

ActionMan.discardEdits = (type, pubId) => {
	return ActionMan.crud(type, pubId, 'discard-edits');	
};

ActionMan.delete = (type, pubId) => {
	// ?? put a safety check in here??
	return ActionMan.crud(type, pubId, 'delete')
		.then(e => {
			console.warn("deleted!", type, pubId, e);
			// remove the local version
			DataStore.setValue(['data', type, pubId], null);
			// invalidate any cached list of this type
			DataStore.invalidateList(type);
			return e;
		});
};

// ServerIO //
const servlet4type = (type) => {
	let stype = type.toLowerCase();
	// NGO = charity
	if (stype==='ngo') stype = 'charity';
	// "advert"" can fall foul of adblocker!	
	if (stype==='advert') stype = 'vert';
	if (stype==='advertiser') stype = 'vertiser';
	return stype;
};

ServerIO.crud = function(type, item, action) {	
	assert(C.TYPES.has(type), type);
	assert(item && getId(item), item);
	assert(C.CRUDACTION.has(action), type);
	let params = {
		method: 'POST',
		data: {
			action: action,
			type: type,
			item: JSON.stringify(item)
		}
	};		
	if (action==='new') {
		params.data.name = item.name; // pass on the name so server can pick a nice id if action=new
	}
	let stype = servlet4type(type);
	// NB: load() includes handle messages
	return ServerIO.load('/'+stype+'/'+encURI(getId(item))+'.json', params);
};
ServerIO.saveEdits = function(type, item) {
	return ServerIO.crud(type, item, 'save');
};
ServerIO.publishEdits = function(type, item) {
	return ServerIO.crud(type, item, 'publish');
};
ServerIO.discardEdits = function(type, item) {
	return ServerIO.crud(type, item, 'discard-edits');
};

/**
 * get an item from the backend -- does not save it into DataStore
 */
ServerIO.getDataItem = function({type, id, status, swallow, ...other}) {
	assert(C.TYPES.has(type), 'Crud.js - ServerIO - bad type: '+type);
	if ( ! status) {
		console.warn("Crud.js - ServerIO.getDataItem: no status - this is unwise! Editor pages should specify DRAFT. type: "+type+" id: "+id);
	}
	assMatch(id, String);
	const params = {data: {status, ...other}, swallow};
	return ServerIO.load('/'+servlet4type(type)+'/'+encURI(id)+'.json', params);
};
/**
 * get an item from DataStore, or call the backend if not there (and save it into DataStore)
 */
ActionMan.getDataItem = ({type, id, status, ...other}) => {
	assert(C.TYPES.has(type), 'Crud.js - ActionMan getDataItem - bad type: '+type);
	assMatch(id, String);
	return DataStore.fetch(['data', type, id], () => {
		return ServerIO.getDataItem({type, id, status, ...other});
	});
};

/**
 * Smooth update: Get an update from the server without null-ing out the local copy.
 */
ActionMan.refreshDataItem = ({type, id, status, ...other}) => {
	console.log("refreshing...", type, id);
	assert(C.TYPES.has(type), 'Crud.js - ActionMan refreshDataItem - bad type: '+type);
	assMatch(id, String);
	return ServerIO.getDataItem({type, id, status, ...other})
		.then(res => {
			if (res.success) {
				console.log("refreshed", type, id);
				let item = res.cargo;
				DataStore.setData(item);				
			} else {
				console.warn("refresh-failed", res, type, id);
			}
		});
};

const CRUD = {	
};
export default CRUD;
