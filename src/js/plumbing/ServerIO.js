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
import DataStore from '../base/plumbing/DataStore';
import Messaging, {notifyUser} from '../base/plumbing/Messaging';

import ServerIO from '../base/plumbing/ServerIOBase';

ServerIO.APIBASE = '';
// ServerIO.APIBASE = 'https://test.sogive.org';
// ServerIO.APIBASE = 'https://test.sogive.org';
// ServerIO.APIBASE = 'https://app.sogive.org';

ServerIO.checkBase();

ServerIO.getServletForType = (type) => {
	if (C.TYPES.isNGO(type)) {
		return 'charity';
	}
	return type.toLowerCase();
};

/**
 * @param query {!String} query string
 * @param status {?KStatus} optional to request draft
 */
ServerIO.searchCharities = function({q, prefix, from, size, status, recommended}) {
	// assMatch( q || prefix, String);
	return ServerIO.load('/search.json', {data: {q, prefix, from, size, status, recommended}} );
};


ServerIO.getCharity = function(charityId, status) {
	return ServerIO.getDataItem({type: C.TYPES.NGO, id: charityId, status: status});
};


ServerIO.getDonations = function({from, to, fundRaiser, status=C.KStatus.PUBLISHED}) {		
	const params = {
		data: {
			from, to,
			status,
			sort:'date-desc'
		}
	};
	// if (fundRaiser) { TODO
	// 	assMatch(fundRaiser, String);
	// 	params.data.q = 'fundRaiser:'+fundRaiser;
	// }
	return ServerIO.load('/donation/_list.json', params);
};

/**
 * TODO handle charity or fundraiser
 */
ServerIO.getDonationDraft = ({from, charity, fundRaiser}) => {
	assMatch(charity || fundRaiser, String);
	let to = charity;
	let q = fundRaiser? "fundRaiser:"+fundRaiser : null;
	let status = C.KStatus.DRAFT;
	return ServerIO.load('/donation/_list.json', {data: {from, to, q, status}, swallow: true});
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

export default ServerIO;
