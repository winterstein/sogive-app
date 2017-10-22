import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../utils/printer.js';
import {modifyHash, encURI} from 'wwutils';
import C from '../C';
import Roles from '../Roles';
import Misc from './Misc';
import DataStore from '../plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import ActionMan from '../plumbing/ActionMan';
import {getType, getId} from '../data/DataClass';
import ListLoad from './ListLoad';

const EventPage = () => {
	// which event?	
	let path = DataStore.getValue(['location','path']);
	let eventId = path[1];
	if (eventId) return <Event id={eventId} />;
	return <ListLoad type={C.TYPES.Event} />;
};

const Event = ({id}) => {
	let pEvent = ActionMan.getDataItem({type:C.TYPES.Event, id:id});
	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	console.warn("pEvent", pEvent.value);
	return (<div>
		<h2>Event {id} </h2>
		TODO {""+pEvent.value}
		name
		date
		ticket types
		images: logo, banner, background
		<Misc.SavePublishDiscard type={C.TYPES.Event} id={id} />
	</div>);
};

export default EventPage;
