import React from 'react';
import ReactDOM from 'react-dom';

import MDText from '../base/components/MDText'

import SJTest, {assert} from 'sjtest';
import { modifyHash, encURI, uid } from 'wwutils';
import { Button, Well } from 'react-bootstrap';

import printer from '../base/utils/printer.js';
import C from '../C';
import Roles from '../base/Roles';
import Misc from '../base/components/Misc';
import DataStore from '../base/plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import {getType, getId, nonce} from '../base/data/DataClass';
import ListLoad, {CreateButton} from '../base/components/ListLoad';
import FundRaiser from '../data/charity/FundRaiser';

const EventPage = () => {
	// which event?	
	let path = DataStore.getValue(['location','path']);
	let eventId = path[1];
	if (eventId) {
		return <Event id={eventId} />;
	}
	// list
	let type = C.TYPES.Event;
	let pvCanEdit = Roles.iCan(C.CAN.editEvent);
	return (
		<div>
			<h2>Pick an Event</h2>
			<ListLoad type={type} status={C.KStatus.PUBLISHED} />
			{pvCanEdit.value? <div><h4>Draft Events</h4>
				<ListLoad type={type} status={C.KStatus.DRAFT} />
				<CreateButton type={type} />
			</div> 
				: null}
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
	let canEdit = Roles.iCan(C.CAN.editEvent).value;
	return (
		<div className="col-md-8 col-md-offset-2">
			<h2>{item.name || 'Event '+id} </h2>		
			<small>ID: {id}</small>		
			{logo? <img src={logo} className='img-thumbnail' alt='event logo' /> : null}
			<center>
				{item.date? <Misc.LongDate date={item.date} /> : null}
				{item.description? <MDText source={item.description} /> : null}				
				{item.url? <div><a href={item.url}>Event website</a></div> : null}
			</center>

			<Register event={item} />
	
			{item.backgroundImage? <img src={item.backgroundImage} className='img-thumbnail' width='200px' /> : null}

			{canEdit? <div className='pull-right'><small><a href={modifyHash(['editEvent',id], null, true)}>edit</a></small></div> : null}
		</div>
	);
};

const Register = ({event}) => {
	assert(event);
	// published?
	if (false && event.status !== C.KStatus.PUBLISHED) {
		return (<center><a title='This is a draft - you can only register from the published event page' className='btn btn-lg btn-primary disabled'>Register</a></center>);	
	}
	// just a big CTA
	return (<center><a href={'#register/'+getId(event)} className='btn btn-lg btn-primary'>Register</a></center>);
};


export default EventPage;
