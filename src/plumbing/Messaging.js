/**
 * Provides a set of standard functions for managing notifications and other user messages.
 * 
 * Because this is "below" the level of react components, it does not include and UI -- see MessageBar.jsx
 */

import _ from 'lodash';
import DataStore from './DataStore';
import printer from '../utils/printer';

const jsxFromId = {};

/**
 * {
 * 	type
 * 	text
 *  jsx
 *  details
 * 	id
 * }
 */
const notifyUser = (msgOrError) => {
	let msg;
	if (_.isError(msgOrError)) {
		msg = {type:'error', text: msgOrError.message || 'Error'};
	} else if (msgOrError.text) {
		msg = Object.assign({}, msgOrError); // defensive copy
	} else {
		msg = {text: printer.str(msgOrError)};
	}
	let mid = msg.id || printer.str(msg);
	msg.id = mid;

	// HACK allow react to send through custom widgets
	let jsx = msg.jsx;
	if (jsx) {
		// we can't send jsx through the json datastore
		// so stash it here
		delete msg.jsx;
		jsxFromId[msg.id] = jsx;
	}

	let msgs = DataStore.getValue('misc', 'messages-for-user') || {};
	msgs[mid] = msg; //{type:'error', text: action+" failed: "+(err && err.responseText)};
	DataStore.setValue(['misc', 'messages-for-user'], msgs);
};

const Messaging = {
	notifyUser,
	jsxFromId
};
window.Messaging = Messaging;
export {notifyUser};
export default Messaging;
