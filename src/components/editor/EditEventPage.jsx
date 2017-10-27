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
import ListLoad from '../ListLoad';

const EditEventPage = () => {
	// which event?	
	let path = DataStore.getValue(['location','path']);
	let eventId = path[1];
	if (eventId) return <EventEditor id={eventId} />;
	let type = C.TYPES.Event;
	let servlet = path[0];
	let create = () => {
		// make an id
		let id = nonce();
		// poke a new blank into DataStore
		DataStore.setValue(['data', type, id], {id});
		// set the id
		modifyHash([servlet, id]);
	};
	return (<div>
		<button className='btn btn-default' onClick={create}><Misc.Icon glyph='plus' /> Create</button>
		<h2>Edit an Event</h2>
		<ListLoad type={type} />
	</div>);
};

const EventEditor = ({id}) => {
	let type = C.TYPES.Event;
	let pEvent = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.DRAFT});
	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	console.warn("pEvent", pEvent.value);
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
				<TicketTypeEditor key={'tt'+i} path={path.concat(['ticketTypes', i])} ticketType={tt} />) 
				: <p>No tickets yet!</p>
			}
			<button onClick={addTicketType}><Misc.Icon glyph='plus' /> Create</button>
		</Misc.Card>

		<Misc.SavePublishDiscard type={type} id={id} />
	</div>);
};

const TicketTypeEditor = ({ticketType, path}) => {
	return (<div className='well'>{printer.str(ticketType)}
		<Misc.PropControl type='MonetaryAmount' item={ticketType} path={path} prop='price' />
	</div>);
};

export default EditEventPage;
