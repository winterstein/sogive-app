/** 
 * Wrapper for server calls.
 *
 */
import _ from 'lodash';
import $ from 'jquery';
import {SJTest, assert, assMatch} from 'sjtest';
import {XId, encURI} from 'wwutils';
import C from '../C.js';

import Login from 'you-again';
import NGO from '../data/charity/NGO';

// Try to avoid using this for modularity!
import DataStore from './DataStore';

// Error Logging - but only the first error
window.onerror = _.once(function(messageOrEvent, source, lineno, colno, error) {
	// NB: source & line num are not much use in a minified file
	let msg = error? ""+error+"\n\n"+error.stack : ""+messageOrEvent;
	$.ajax('/log', {data: {
		msg: window.location+' '+msg+' user-id: '+Login.getId(), // NB: browser type (user agent) will be sent as a header
		type: "error"
	}});
});

const ServerIO = {};
export default ServerIO;

// for debug
window.ServerIO = ServerIO;


/**
 * @param query {!String} query string
 * @param status {?KStatus} optional to request draft
 */
ServerIO.search = function({q, from, size, status, recommended}) {
	assert(_.isString(q), q);
	return ServerIO.load('/search.json', {data: {q, from, size, status, recommended}} );
};


ServerIO.getCharity = function(charityId, status) {
	return ServerIO.getDataItem({type: C.TYPES.NGO, id: charityId, status: status});
};


ServerIO.donate = function(data) {
	// Anything to assert here?
	return ServerIO.post('/donation', data);
};

ServerIO.getDonations = function() {
	return ServerIO.load('/donation/list');
};


ServerIO.saveCharity = function(charity, status) {
	assert(NGO.isa(charity), charity);
	let params = {		
		data: {action: 'save', item: JSON.stringify(charity), status: status},
		method: 'PUT'};
	return ServerIO.load('/charity/'+encURI(NGO.id(charity))+'.json', params);
};

ServerIO.publish = function(charity, status) {
	assert(NGO.isa(charity), charity);
	let params = {		
		data: {action: 'publish', status: status}
	};
	return ServerIO.load('/charity/'+encURI(NGO.id(charity))+'.json', params);
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


/**
 * Submits an AJAX request. This is the key base method
 *
 * @param {String} url The url to which the request should be made.
 *
 * @param {Object} [params] Optional map of settings to modify the request.
 * See <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax</a> for details.
 * IMPORTANT: To specify form data, use params.data
 *
 * To swallow any messages returned by the server - use params.swallow=true
 *
 * @returns A <a href="http://api.jquery.com/jQuery.ajax/#jqXHR">jqXHR object</a>.
**/
ServerIO.load = function(url, params) {
	assMatch(url,String);
	console.log("ServerIO.load", url, params);
	params = ServerIO.addDefaultParams(params);
	if ( ! params.data) params.data = {};
	// sanity check: no Objects except arrays
	_.values(params.data).map(
		v => assert( ! _.isObject(v) || _.isArray(v), v)
	);
	// sanity check: status
	assert( ! params.data.status || C.KStatus.has(params.data.status), params.data.status);
	// add the base
	if (url.substring(0,4) !== 'http' && ServerIO.base) {
		url = ServerIO.base + url;
	}
	params.url = url;
	// send cookies
	params.xhrFields = {withCredentials: true};
	params.data.withCredentials = true; // let the server know this is a with-credentials call
	// add auth
	if (Login.isLoggedIn()) {
		params.data.as = Login.getId();
		params.data.jwt = Login.getUser().jwt;
	}
	// debug: add stack
	if (window.DEBUG) {
		try {
			const stack = new Error().stack;			
			// stacktrace, chop leading "Error at Object." bit
			params.data.stacktrace = (""+stack).replace(/\s+/g,' ').substr(16);
		} catch(error) {
			// oh well
		}
	}
	// Make the ajax call
	let defrd = $.ajax(params); // The AJAX request.
	if (params.swallow) {
		// no message display
		return defrd;
	}
	defrd = defrd
			.then(ServerIO.handleMessages)
			.fail(function(response, huh, bah) {
				console.error('fail',url,params,response,huh,bah);
				let msg = {
					id: 'error from '+params.url,
					type:'error', 
					text: (response && response.responseText) || "Could not load "+params.url+" from the server"
				};
				if (response.status === 404) {
					msg.text = "404: Sadly that content could not be found.";
				}
				// HACK hide details
				if (msg.text.indexOf('\n----') !== -1) {
					let i = msg.text.indexOf('\n----');
					msg.details = msg.text.substr(i);
					msg.text = msg.text.substr(0, i);
				}
				// bleurgh - a frameworky dependency
			Messaging.notifyUser(msg);
				return response;
			}.bind(this));
	return defrd;
};

ServerIO.post = function(url, data) {
	return ServerIO.load(url, {data, method:'POST'});
};

ServerIO.handleMessages = function(response) {
	console.log('handleMessages',response);
	const newMessages = response && response.messages;
	if ( ! newMessages || newMessages.length===0) {
		return response;
	}
	newMessages.forEach(msg => addMessage(msg));
	return response;
};

ServerIO.addDefaultParams = function(params) {
	if ( ! params) params = {};
	if ( ! params.data) params.data = {};
	return params;
};

ServerIO.importDataSet = function(dataset) {
	assert(_.isString(dataset));
	return ServerIO.load('/import.json', {data: {dataset}} );
};
