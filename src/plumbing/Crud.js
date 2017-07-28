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

ActionMan.crud = (type, id, action) => {
	assMatch(id, String);
	assert(C.TYPES.has(type), type);
	let publisher = DataStore.getData(type, id);
	if ( ! publisher.id) {
		assert(id==='new');
		publisher.id = id;
	}
	DataStore.setValue(['transient', id, 'status'], C.STATUS.saving);
	ServerIO.crud(type, publisher, action)
	.then(DataStore.updateFromServer)
	.then(() => {
		DataStore.setValue(['transient', id, 'status'], C.STATUS.clean);
	});
};

ActionMan.saveEdits = (type, pubId) => {
	return ActionMan.crud(type, pubId, 'save');
};

ActionMan.publishEdits = (type, pubId) => {
	return ActionMan.crud(type, pubId, 'publish');	
};

ActionMan.discardEdits = (type, pubId) => {
	return ActionMan.crud(type, pubId, 'discard-edits');	
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
	let stype = type.toLowerCase();
	// "advert"" can fall foul of adblocker!
	if (stype==='advert') stype = 'vert';
	if (stype==='advertiser') stype = 'vertiser';
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
