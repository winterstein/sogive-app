import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../utils/printer.js';
import {modifyHash, encURI, uid} from 'wwutils';
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
	let type = C.TYPES.Event;
	return (<div>
		<h2>Pick an Event</h2>
		<ListLoad type={type} />
		<div><a href='#editEvent'>Create / edit events</a></div>
	</div>);
};

const Event = ({id}) => {
	let type = C.TYPES.Event;
	let pEvent = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.DRAFT});
	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	let item = pEvent.value;
	return (<div>
		<h2>{item.name || 'Event '+id} </h2>		
		<small>ID: {id}</small>		
		<img src={item.img} className='img-thumbnail' alt='event logo' />
		<div>
			{item.description}
		</div>
	</div>);
};

export default EventPage;
