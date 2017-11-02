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
import {getType, getId, nonce} from '../data/DataClass';
import ListLoad from './ListLoad';

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
			<div><a href='#editEvent'>Create / edit events</a></div>
		</div>
	);
};

const Event = ({id}) => {
	let type = C.TYPES.Event;
	let pEvent = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.DRAFT});

	let servlet = 'editFundraiser';
	let createFundraiser = () => {
		// make an id
		const frid = nonce();

		// poke a new blank into DataStore
		DataStore.setValue(['data', C.TYPES.FundRaiser, frid], {id: frid, event: id});
		// set the id
		modifyHash([servlet, frid]);
	};


	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	let item = pEvent.value;
	return (
		<div>
			<h2>{item.name || 'Event '+id} </h2>		
			<small>ID: {id}</small>		
			<img src={item.img} className='img-thumbnail' alt='event logo' />
			<div>
				{item.description}
			</div>

			<Register event={item} />

			<button className='btn btn-default' onClick={createFundraiser}><Misc.Icon glyph='plus' />Create Fundraiser For This Event</button>
		</div>
	);
};

const Register = ({event}) => {
	if ( ! event.ticketTypes) {
		return <p>Register: Define some ticket types!</p>;
	}
	return (<Misc.Card title='Register'>
		{event.ticketTypes.map((tt,ti) => <RegisterTicket key={ti} event={event} ticketType={tt} />)}
	</Misc.Card>);
};

const RegisterTicket = ({event,ticketType}) => {
	return (<a href={'#register/'+getId(event)+'/'+getId(ticketType)} className='btn btn-default'>
		{ticketType.name} <Misc.Money amount={ticketType.price} />
	</a>);
};

export default EventPage;
