/** 
 * Wrapper for server calls, which populates DataStore.
 *
 * This can choose whether or not to use cached values.
 * 
 */
import _ from 'lodash';
import $ from 'jquery';
import {SJTest, assert, assertMatch} from 'sjtest';
import C from '../C.js';

import DataStore from './DataStore.js';
// import Login from 'hooru';

const ServerIO = {};

/**
 * Submits an AJAX request. This is the key base method
 *
 * @param {String} url The url to which the request should be made.
 
 * @param {Object} [params] Optional map of settings to modify the request.
 * See <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax</a> for details.
 * To specify form data, use params.data
 
 * To swallow any messages returned by the server - use params.swallow=true
 * 
 * @returns A <a href="http://api.jquery.com/jQuery.ajax/#jqXHR">jqXHR object</a>.
**/
ServerIO.load = function(url, params) {
	assertMatch(url,String);
	console.log("ServerIO.load", url, params);
	params = ServerIO.addDefaultParams(params);
	// sanity check: no Objects except arrays
	_.values(params.data).map(
		v => assert( ! _.isObject(v) || _.isArray(v), v) 
	);
	// add the base
	if (url.substring(0,4) != 'http' && ServerIO.base) {
		url = ServerIO.base + url;
	}
	params.url = url;
	// send cookies
	params.xhrFields = {withCredentials: true};
	// debug: add stack
	if (window.DEBUG) {
		try {
			const stack = new Error().stack;
			if ( ! params.data) params.data = {};
			// stacktrace, chop leading "Error at Object." bit
			params.data.stacktrace = (""+stack).replace(/\s+/g,' ').substr(16);
		} catch(error) {
			// oh well
		}
	}
	// Make the ajax call
	var defrd = $.ajax(params); // The AJAX request.
	if (params.swallow) {
		// no message display
		return defrd;
	}
	defrd = defrd
			.then(ServerIO.handleMessages)
			.fail(function(response) {
				console.error('fail',url,params,response);
				ServerIO.ActionMan.perform({
					verb:C.action.notify, 
					messages:[{
						type:'error', 
						text:'Failed to load: '+url
					}]
				});
				return response;
			}.bind(this));
	return defrd;
};

ServerIO.post = function(url, data) {
	return ServerIO.load(url, {data:data, method:'POST'});
};

ServerIO.handleMessages = function(response) {
	console.log('handleMessages',response);
	const newMessages = response && response.messages;
	if ( ! newMessages || newMessages.length===0) {
		return response;
	}
	ServerIO.ActionMan.perform({verb:C.action.notify, messages:newMessages});
	return response;
};

ServerIO.addDefaultParams = function(params) {
	if ( ! params) params = {};
	if ( ! params.data) params.data = {};
	return params;
};

ServerIO.getCharity = function(charityId) {
    return ServerIO.load('/mock-server/'+charityId+'.json');
}
