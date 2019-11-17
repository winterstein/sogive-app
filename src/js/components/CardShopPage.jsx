import React from 'react';
import ReactDOM from 'react-dom';

import { Jumbotron, Well, Button, Label } from 'react-bootstrap';
import SJTest, {assert} from 'sjtest';
import {XId, encURI, yessy, modifyHash} from 'wwutils';
import Login from 'you-again';
import BS from '../base/components/BS';
import printer from '../base/utils/printer.js';
import C from '../C';
import DataStore from '../base/plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import ServerIO from '../plumbing/ServerIO';
import { getId, getType } from '../base/data/DataClass';
import Basket from '../data/Basket';
import Event from '../data/charity/Event';
import NGO from '../data/charity/NGO2';
import Ticket from '../data/charity/Ticket';
import Money from '../base/data/Money';
import FundRaiser from '../data/charity/FundRaiser';
import { SearchResults } from './SearchPage';
import Roles from '../base/Roles';
import Misc from '../base/components/Misc';
import { LoginWidgetEmbed } from '../base/components/LoginWidget';
import DonationWizard from './DonationWizard';
import Wizard, {WizardStage} from '../base/components/WizardProgressWidget';
import PaymentWidget from '../base/components/PaymentWidget';

/**
 * Sign up for an event!
 */
const CardShopPage = () => {
	let eventId = DataStore.getValue('location', 'path')[1];
	if ( ! eventId) {
		// TODO search for "shop" event
		modifyHash(['event']);
		return null;
	}
	const pvEvent = ActionMan.getDataItem({type:C.TYPES.Event, id:eventId, status:C.KStatus.PUBLISHED});
	if ( ! pvEvent.value) return <Misc.Loading />;
	const event = pvEvent.value;

	const pvbasket = ActionMan.getBasketPV();
	const basket = pvbasket.value;

	return (
		<div className=''>
			<div className='fullwidth-bg' style={{backgroundImage: 'url('+event.backgroundImage+')'}} />
			{event.bannerImage? <img className='page-banner' src={event.bannerImage} alt='banner' /> : null}
			<h2 className='page-masthead'>
				<span className='event-name'>{event.name}</span>
			</h2>
			<h4>Show your impact and share your love in this holiday season.</h4>
			
			<h2>How it Works</h2>
			<ol>
				<li>Buy a card - only £5, which includes a high-impact donation.</li>
				<li>We transfer the donation to the charity.</li>
				<li>We post your card, including a handwritten note, to your family member or friend.</li>
				<li>We also send an e-Card to their email.</li>
			
			</ol>

			<h2>Pick a Card and Make a Difference</h2>
			<BS.Row>
				{event.ticketTypes.map(t => <BS.Col md={4} key={t.id} ><Card basket={basket} ticket={t} /></BS.Col>)}
			</BS.Row>

			{basket? <Misc.SavePublishDiscard type={C.TYPES.Basket} id={getId(basket)} hidden /> : null}

		</div>
	);
};

const Card = ({basket, ticket}) => {
	const addTicketAction = () => {
		ActionMan.addToBasket(basket, ticket);
		modifyHash(['checkout']);
	};
	return (<div className='XmasCard well'>
		<h3>{ticket.name}</h3>
		<h4 className='subtitle'>{ticket.subtitle}</h4>
		<img src={ticket.attendeeIcon} className='xmas-card-preview-img' />
		Charity funded: {ticket.charityId}<br/>
		{ticket.description}
		<center><BS.Button size='lg' color='primary' onClick={addTicketAction}>Buy One</BS.Button></center>
	</div>);
};

export default CardShopPage;
