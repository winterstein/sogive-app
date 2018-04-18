/** 
 * Wrapper for server calls.
 *
 */
import ServerIO from '../base/plumbing/ServerIO';
import _ from 'lodash';
import $ from 'jquery';
import {SJTest, assert, assMatch} from 'sjtest';
import {XId, encURI} from 'wwutils';
import C from '../C.js';

import Login from 'you-again';
import NGO from '../data/charity/NGO';

// Try to avoid using this for modularity!
import DataStore from '../base/plumbing/DataStore';
import Messaging, {notifyUser} from '../base/plumbing/Messaging';

/**
 * @param query {!String} query string
 * @param status {?KStatus} optional to request draft
 */
ServerIO.search = function({q, prefix, from, size, status, recommended}) {
	// assMatch( q || prefix, String);
	return ServerIO.load('/search.json', {data: {q, prefix, from, size, status, recommended}} );
};


ServerIO.getCharity = function(charityId, status) {
	return ServerIO.getDataItem({type: C.TYPES.NGO, id: charityId, status: status});
};


ServerIO.donate = function(data) {
	// Anything to assert here?
	return ServerIO.post('/donation', data);
};

ServerIO.getDonations = function({from, to, status=C.KStatus.PUBLISHED}) {	
	const params = {
		data: {
			from, to,
			status,
			sort:'date-desc'
		}
	};
	return ServerIO.load('/donation/list', params);
};

/**
 * TODO delete and just use Crud.js
 */
ServerIO.saveCharity = function(charity, status) {
	assert(NGO.isa(charity), charity);
	let params = {		
		data: {action: 'save', item: JSON.stringify(charity), status: status},
		method: 'PUT'};
	return ServerIO.load('/charity/'+encURI(NGO.id(charity))+'.json', params);
};


/**
 * TODO handle charity or fundraiser
 */
ServerIO.getDonationDraft = ({from, charity, fundRaiser}) => {
	assMatch(charity || fundRaiser, String);
	let to = charity;
	let q = fundRaiser? "fundRaiser:"+fundRaiser : null;
	let status = C.KStatus.DRAFT;
	return ServerIO.load('/donation/list.json', {data: {from, to, q, status}, swallow: true});
};


/**
 * @param charity {name:String}
 */
ServerIO.addCharity = function(charity, status=C.KStatus.DRAFT) {
	let params = {		
		data: {action: 'new', item: JSON.stringify(charity), status: status},
		method: 'PUT'};
	return ServerIO.load('/charity.json', params);
};

ServerIO.discardEdits = function(charity, status) {
	assert(NGO.isa(charity), charity);
	let params = {		
		data: {action: 'discard-edits', status: status}
	};
	return ServerIO.load('/charity/'+encURI(NGO.id(charity))+'.json', params);
};

export default ServerIO;
// for debug
window.ServerIO = ServerIO;

