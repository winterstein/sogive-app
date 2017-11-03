import React from 'react';
import ReactDOM from 'react-dom';

import { Tabs, Tab } from 'react-bootstrap';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../utils/printer.js';
import C from '../C';
import DataStore from '../plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import Roles from '../Roles';
import Misc from './Misc';
import GiftAidForm from './GiftAidForm';
import {LoginWidgetEmbed} from './LoginWidget/LoginWidget';

const RegisterPage = () => {
	let eventId = DataStore.getValue('location','path')[1];
	let ticketTypeId = DataStore.getValue('location','path')[2];

	const pvEvent = ActionMan.getDataItem({type:C.TYPES.Event, id:eventId});
	if ( ! pvEvent.value) return <Misc.Loading />;
	const event = pvEvent.value;

	const wspath = ['widget', 'RegisterPage', eventId];
	const widgetState = DataStore.getValue(wspath) || {};
	const stagePath = wspath.concat('stage');
	return (
		<div className=''>
			<h2>Register &amp; get tickets for {event.name}</h2>
			TODO a multi-part form
			<Tabs activeKey={widgetState.stage} onSelect={key => DataStore.setValue(stagePath, key)} id='register-stages'>
				<Tab eventKey={1} title='Ticket(s)'>
					allow multiple tickets
					if ticketTypeId start with 1 of that type
				</Tab>
				<Tab eventKey={2} title='Register'>
					<p>Please register to create an account.</p>
					<LoginWidgetEmbed services={['twitter']} />
				</Tab>
				<Tab eventKey={3} title='Your Details'>					
					for each ticket if several
					with a checkbox to say "same address as lead"
				</Tab>
				<Tab eventKey={4} title='Your Charity'>					
				</Tab>
				<Tab eventKey={5} title='Checkout'>					
				</Tab>
				<Tab eventKey={6} title='COnfirmation'>					
				</Tab>
			</Tabs>
		</div>
	);
};

export default RegisterPage;
