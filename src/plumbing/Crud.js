/** Add "standard crud functions" to ServerIO and ActionMan */

import _ from 'lodash';
import $ from 'jquery';
import {SJTest, assert, assMatch} from 'sjtest';
import C from '../C.js';
import DataStore from './DataStore';
import {getId} from '../data/DataClass';
import Login from 'you-again';
import {XId, encURI} from 'wwutils';

import ServerIO from './ServerIO';
import ActionMan from './ActionMan';

/**
 * @returns Promise
 */
ActionMan.crud = (type, id, action, item) => {
	assMatch(id, String);
	assert(C.TYPES.has(type), type);
	if ( ! item) item = DataStore.getData(type, id);
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
	})
	.fail((err) => {
		// bleurgh
		console.warn(err);
		DataStore.setLocalEditsStatus(type, id, C.STATUS.dirty);
		return err;
	});
}; // ./crud

ActionMan.saveEdits = (type, pubId, item) => {
	return ActionMan.crud(type, pubId, 'save', item);
};

ActionMan.publishEdits = (type, pubId, item) => {
	return ActionMan.crud(type, pubId, 'publish', item);	
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
ServerIO.getDataItem = function({type, id, status}) {
	assert(C.TYPES.has(type), 'ServerIO - bad type: '+type);
	assMatch(id, String);
	const params = {data: {status}};
	return ServerIO.load('/'+servlet4type(type)+'/'+encURI(id)+'.json', params);
};
ActionMan.getDataItem = ({type, id, status}) => {
	return DataStore.fetch(['data', type, id], () => {
		return ServerIO.getDataItem({type, id, status});
	});
};

ServerIO.getDonationDraft = ({to}) => {
	return ServerIO.load('/donation/getDraft.json', {data: {to}});
};

ActionMan.getDonationDraft = ({to}) => {
	return ServerIO.getDonationDraft({to});
};

const CRUD = {	
};
export default CRUD;
