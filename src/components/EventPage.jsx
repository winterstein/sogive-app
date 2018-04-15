import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import { modifyHash, encURI, uid } from 'wwutils';
import { Button, Well } from 'react-bootstrap';

import printer from '../utils/printer.js';
import C from '../C';
import Roles from '../base/Roles';
import Misc from './Misc';
import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import ActionMan from '../plumbing/ActionMan';
import {getType, getId, nonce} from '../data/DataClass';
import ListLoad from './ListLoad';
import FundRaiser from '../data/charity/FundRaiser';

const EventPage = () => {
	// which event?	
	let path = DataStore.getValue(['location','path']);
	let eventId = path[1];
	if (eventId) return <Event id={eventId} />;
	let type = C.TYPES.Event;

	// which event?	

	return (
		<div>
			<h2>Pick an Event</h2>
			<ListLoad type={type} />
			<hr />
			<div><a href='#editEvent'>Create / edit events</a></div>
		</div>
	);
};

const Event = ({id}) => {
	let type = C.TYPES.Event;
	let pEvent = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.DRAFT});

	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	let item = pEvent.value;
	let logo = item.logoImage || item.img;
	return (
		<div className="col-md-8 col-md-offset-2">
			<h2>{item.name || 'Event '+id} </h2>		
			<small>ID: {id}</small>		
			{logo? <img src={logo} className='img-thumbnail' alt='event logo' /> : null}
			<center>
				{item.description}
			</center>

			<Register event={item} />

		</div>
	);
};

const Register = ({event}) => {
	assert(event);
	// just a big CTA
	return (<center><a href={'#register/'+getId(event)} className='btn btn-lg btn-primary'>Register</a></center>);
};


export default EventPage;
