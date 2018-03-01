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
import Messaging, {notifyUser} from './Messaging';

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

// allow switching backend during testing
ServerIO.base = 
	null;
	// 'https://app.sogive.org';


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

ServerIO.getDonations = function({from, to}) {	
	const params = {
		data: {
			from, to
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
	return ServerIO.load('/donation/list.json', {data: {from, to, q}, swallow: true});
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

ServerIO.upload = function(file, progress, load) {
	// Provide a pre-constructed XHR so we can insert progress/load callbacks
	const xhr = () => {
		const request = $.ajaxSettings.xhr();
		request.onProgress = progress;
		request.onLoad = load; // ??@Roscoe - Any particular reason for using onLoad instead of .then? ^Dan
		return request;
	};

	const data = new FormData(); // This is a browser native thing: https://developer.mozilla.org/en-US/docs/Web/API/FormData
	data.append('upload', file);

	return ServerIO.load('/upload.json', {
		xhr,
		data,
		type: 'POST',
		contentType: false,
		processData: false,
		swallow: true,
	});
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
 * {
 * 	// Our parameters
 * 	swallow: true to swallow any messages returned by the server.   
 * 
 * 	// jQuery parameters (partial notes only)
 * 	data: {Object} data to send - this should be a simple key -> primitive-value map.   
 * 	xhr: {Function} Used for special requests, e.g. file upload
 * }
 
 *
 * @returns A <a href="http://api.jquery.com/jQuery.ajax/#jqXHR">jqXHR object</a>.
**/
ServerIO.load = function(url, params) {
	assMatch(url,String);
	console.log("ServerIO.load", url, params);
	params = ServerIO.addDefaultParams(params);
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
	// send cookies & add auth
	Login.sign(params);
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
			// error message
			let text = response.status===404? 
				"404: Sadly that content could not be found."
				: "Could not load "+params.url+" from the server";
			if (response.responseText && ! (response.status >= 500)) {
				// NB: dont show the nginx error page for a 500 server fail
				text = response.responseText;
			}
			let msg = {
				id: 'error from '+params.url,
				type:'error', 
				text
			};
			// HACK hide details
			if (msg.text.indexOf('\n----') !== -1) {
				let i = msg.text.indexOf('\n----');
				msg.details = msg.text.substr(i);
				msg.text = msg.text.substr(0, i);
			}
			// bleurgh - a frameworky dependency
			notifyUser(msg);
			return response;
		});
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
	newMessages.forEach(msg => notifyUser(msg));
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
