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
import ActionMan from '../../plumbing/ActionMan';
import {getType, getId, nonce} from '../../data/DataClass';
import Ticket from '../../data/charity/Ticket';
import ListLoad, {CreateButton} from '../ListLoad';

const EditEventPage = () => {
	if ( ! Login.isLoggedIn()) {
		return <div className='alert alert-warning'><h3>Please login</h3></div>;
	}
	// which event?	
	let path = DataStore.getValue(['location','path']);
	let eventId = path[1];
	if (eventId) return <EventEditor id={eventId} />;
	let type = C.TYPES.Event;
	let servlet = path[0];
	return (<div>
		<CreateButton type={type} />
		<h2>Edit an Event</h2>
		<ListLoad type={type} servlet='event' navpage='editEvent' />
	</div>);
};

const EventEditor = ({id}) => {
	let type = C.TYPES.Event;
	let pEvent = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.DRAFT});
	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	let item = pEvent.value;

	const addTicketType = () => {
		const tt = Ticket.make({}, item.id);
		item.ticketTypes = (item.ticketTypes || []).concat(tt);
		DataStore.update();
	};

	const path = ['data', type, id];
	return (<div>
		<h2>Event {item.name || id} </h2>		
		<small>ID: {id}</small>
		<Misc.PropControl path={path} prop='name' item={item} label='Event Name' />

		<Misc.PropControl path={['data', type, id]} prop='date' item={item} label='Event Date' type='date' />
		
		<Misc.PropControl path={['data', type, id]} prop='description' item={item} label='Description' type='textarea' />

		<Misc.PropControl path={['data', type, id]} prop='matchedFunding' item={item} label='Matched funding? e.g. 40% for The Kiltwalk' type='number' />

		<Misc.PropControl path={['data', type, id]} prop='img' item={item} label='Square Logo Image' type='img' />
		<Misc.PropControl path={['data', type, id]} prop='imgBanner' item={item} label='Banner Image' type='img' />

		<Misc.Card title='Ticket Types' icon='ticket'>
			{item.ticketTypes? item.ticketTypes.map( (tt, i) => 
				<TicketTypeEditor key={'tt'+i} path={path.concat(['ticketTypes', i])} ticketType={tt} event={item} />) 
				: <p>No tickets yet!</p>
			}
			<button onClick={addTicketType}><Misc.Icon glyph='plus' /> Create</button>
		</Misc.Card>

		<Misc.SavePublishDiscard type={type} id={id} />
	</div>);
};

const TicketTypeEditor = ({ticketType, path, event}) => {
	const removeTicketType = () => {
		event.ticketTypes = event.ticketTypes.filter(tt => tt !== ticketType);
		DataStore.update();
	};
	return (<div className='well'>{printer.str(ticketType)}
		<small>{ticketType.id}</small>
		<Misc.PropControl item={ticketType} path={path} prop='name' label='Name' />
		<Misc.PropControl type='MonetaryAmount' item={ticketType} path={path} prop='price' label='Price' />
		<button className='btn btn-danger' onClick={removeTicketType}><Misc.Icon glyph='trash'/></button>
	</div>);
};

export default EditEventPage;
