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
	const pvEvent = ActionMan.getDataItem({type:C.TYPES.Event, id:eventId});
	if ( ! pvEvent.value) return <Misc.Loading />;
	const event = pvEvent.value;

	const wspath = ['widget', 'RegisterPage', eventId];
	const widgetState = DataStore.getValue(wspath) || {};
	const stagePath = wspath.concat('stage');
	const basket = DataStore.getValue('data', C.TYPES.Basket) || {};
	return (
		<div className=''>
			<h2>Register &amp; get tickets for {event.name}</h2>
			TODO a multi-part form
			<Tabs activeKey={widgetState.stage} onSelect={key => DataStore.setValue(stagePath, key)} id='register-stages'>
				<Tab eventKey={1} title='Ticket(s)'>					
					{event.ticketTypes.map((tt,ti) => <RegisterTicket key={ti} event={event} ticketType={tt} />)}
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



const RegisterTicket = ({event,ticketType}) => {
	// TODO put cloned objects into the basket, so we can extra details to them (names & addresses) on a per-ticket basis
	return (<div>		
		<button onClick={() => ActionMan.modifyBasket({id: ticketType.id, qty: 1})}>
			{ticketType.name} <Misc.Money amount={ticketType.price} />
		</button>
	</div>);
};
export default RegisterPage;
