/** 
 * Wrapper for server calls.
 *
 */
import _ from 'lodash';
import $ from 'jquery';
import C from '../C.js';

import NGO from '../data/charity/NGO2';

// Try to avoid using this for modularity!
import DataStore from '../base/plumbing/DataStore';
import Messaging, {notifyUser} from '../base/plumbing/Messaging';

import ServerIO from '../base/plumbing/ServerIOBase';
import KStatus from '../base/data/KStatus.js';

ServerIO.APIBASE = '';
ServerIO.APIBASE = 'https://test.sogive.org';
// ServerIO.APIBASE = 'https://app.sogive.org';

// ?? use media.good-loop.com??
ServerIO.MEDIA_ENDPOINT = '/upload.json';
ServerIO.MEDIA_ENDPOINT = 'https://testmedia.good-loop.com/upload.json';

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
 * @param {?Boolean} recommended If true, return only high-impact "gold" charities. Also fetches legacy recommended charities. @deprecated in favour of impact=high
 * @param {?String} impact e.g. "high" Filter by impact
 */
ServerIO.searchCharities = function({q, prefix, from, size, status, recommended, impact, use_list}) {
	if (use_list) { // HACK experiment
		if ( ! status) status=KStatus.PUBLISHED;
		return ServerIO.load('/charity/_list.json', {data: {q, prefix, from, size, status, recommended, impact}} );
	}
	return ServerIO.load('/search.json', {data: {q, prefix, from, size, status, recommended, impact}} );
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

/**
 * Import editorials for existing charities in database from a published Google doc.
 * 
 * @param publishedEditorialsUrl the URL of the pubslished Google doc containing SoGive editorials.
 */
ServerIO.importEditorials = function(publishedEditorialsUrl) {
	let params = {
		data: {	dataset: 'editorials', url: publishedEditorialsUrl },
		method: 'PUT'
	};
	return ServerIO.load('/import.json', params)
};

export default ServerIO;
