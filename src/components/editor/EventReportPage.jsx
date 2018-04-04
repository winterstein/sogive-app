import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../../utils/printer.js';
import {modifyHash} from 'wwutils';
import C from '../../C';
import Roles from '../../Roles';
import {Loading} from '../Misc';
import DataStore from '../../plumbing/DataStore';
import ServerIO from '../../plumbing/ServerIO';
import ActionMan from '../../plumbing/ActionMan';
import {getType, getId, nonce} from '../../data/DataClass';
import Ticket from '../../data/charity/Ticket';
import Event from '../../data/charity/Event';
import ListLoad, {CreateButton} from '../ListLoad';

const EventReportPage = () => {
	if ( ! Login.isLoggedIn()) {
		return <div className='alert alert-warning'><h3>Please login</h3></div>;
	}
	// which event?	
	let path = DataStore.getValue(['location','path']);
	let eventId = path[1];
	if (eventId) return <EventReport id={eventId} />;
	let type = C.TYPES.Event;
	return (<div>
		<h2>Report / Export for an Event</h2>
		<ListLoad type={type} servlet='event' navpage='eventReport' />
	</div>);
};

const EventReport = ({id}) => {
	let pvItems = DataStore.fetch(['list', 'Ticket', id], () => {
		return ServerIO.load(`/eventReport/${id}/tickets/list.json`)
		.then((res) => {
			// console.warn(res);
			return res.cargo.hits;
		});
	});
	if ( ! pvItems.resolved) {
		return (
			<Loading text={'Tickets for event '+id} />
		);
	}
	return <div>TODO list tickets</div>;
};

export default EventReportPage;
