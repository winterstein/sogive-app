/** Add "standard crud functions" to ServerIO and ActionMan */

import _ from 'lodash';
import $ from 'jquery';
import {SJTest, assert, assMatch} from 'sjtest';
import C from '../C.js';
import DataStore from './DataStore';
import Login from 'you-again';
import {XId} from 'wwutils';

import ServerIO from './ServerIO';
import ActionMan from './ActionMan';

/**
 * @returns Promise
 */
ActionMan.crud = (type, id, action) => {
	assMatch(id, String);
	assert(C.TYPES.has(type), type);
	let publisher = DataStore.getData(type, id);
	if ( ! publisher.id) {
		assert(id==='new');
		publisher.id = id;
	}
	// new item? then change the action
	if (id===C.newId && action==='save') {
		action = 'new';
	}
	// mark the widget as saving
	DataStore.setLocalEditsStatus(type, id, C.STATUS.saving);
	// call the server
	return ServerIO.crud(type, publisher, action)
	.then(DataStore.updateFromServer.bind(DataStore))
	.then((res) => {
		// success :)
		const navtype = type;
		if (action==='delete') {
			DataStore.setUrlValue(navtype, null);
		} else if (id===C.newId) {
			// id change!
			// updateFromServer should have stored the new item
			// So just repoint the focus
			let serverId = res.cargo.id;
			DataStore.setFocus(type, serverId); // deprecated			
			DataStore.setUrlValue(navtype, serverId);
		}
		// clear the saving flag
		DataStore.setLocalEditsStatus(type, id, C.STATUS.clean);
		return res;
	})
	.fail((err) => {
		// bleurgh
		console.warn(err);
		DataStore.setLocalEditsStatus(type, id, C.STATUS.dirty);
		return err;
	});
}; // ./crud

ActionMan.saveEdits = (type, pubId) => {
	return ActionMan.crud(type, pubId, 'save');
};

ActionMan.publishEdits = (type, pubId) => {
	return ActionMan.crud(type, pubId, 'publish');	
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
		return e;
	});
};

ServerIO.crud = function(type, item, action) {	
	assert(C.TYPES.has(type), type);
	assert(item && item.id, item);
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
	let stype = type.toLowerCase();
	// "advert"" can fall foul of adblocker!
	if (stype==='advert') stype = 'vert';
	if (stype==='advertiser') stype = 'vertiser';
	// NB: load() includes handle messages
	return ServerIO.load('/'+stype+'/'+item.id+'.json', params);
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

const CRUD = {	
};
export default CRUD;
