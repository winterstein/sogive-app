import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../../utils/printer.js';
import {modifyHash} from 'wwutils';
import C from '../../C';
import Roles from '../../Roles';
import Misc from '../Misc';
import DataStore from '../../plumbing/DataStore';
import ServerIO from '../../plumbing/ServerIO';
import {getType, getId} from '../../data/DataClass';
import ListLoad from '../ListLoad';

const EditEventPage = () => {
	// which event?	
	let path = DataStore.getValue(['location','path']);
	let eventId = path[1];
	if (eventId) return <EventEditor id={eventId} />;
	return <ListLoad type={C.TYPES.Event} />;
};

const EventEditor = ({id}) => {
	return (<div>
		<h2>Edit Event {id} </h2>
		TODO
		name
		date
		ticket types
		images: logo, banner, background
		<Misc.SavePublishDiscard type={C.TYPES.Event} id={id} />
	</div>);
};

export default EditEventPage;
