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
import MDText from '../base/components/MDText';

/**
 * 
 * @param {Card|Ticket} info 
 */
export const defaultCardMessage = info => {
	let me = '';
	if (info.oxid) {
		let user = Login.getUser();
		if (user.xid === info.oxid) {
			me = user.name;
		} else {
			me = XId.prettyName(info.oxid);
		}
	}
	return `Dear ${info.toName || info.attendeeName || 'Friend'}

Season's Greetings!

From ${me}`;
};

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
			{event.bannerImage? <div className='banner-div'><img className='page-banner' src={event.bannerImage} alt='banner' /></div> : null}
			{/* <h2 className='page-masthead'>
				<span className='event-name'>{event.name}</span>
			</h2> */}
			<br/>
			<MDText source={event.description} />

			<h2>Pick a Card and Make a Difference</h2>
			<BS.Row>
				{event.ticketTypes.map(t => <BS.Col md={4} key={t.id} ><Card basket={basket} ticket={t} event={event} /></BS.Col>)}
			</BS.Row>

			<div className='moreinfo'>
				<h2>F.A.Q.</h2>
				<h4>How much goes to charity?</h4>
				<i>Most of the money!</i> The costs are:<br/>
				£0.50 for the card (sourced from Oxfam, so some of this goes to good causes too)<br/>
				£0.70 postage<br/>
				£0.50 to cover SoGive's costs<br/>
				<i>£3.30 to the charity (or £4.30 for the malaria net card)</i><br/>
				<h4>What countries do you post to?</h4>
				We are UK based, but we will post to <i>any country</i>. 
				For non-UK addresses, the postage will be a bit higher, so the charity donation will be a bit lower.
				<h4>Any other questions? Just email us at <a href='mailto:support@sogive.org'>support@sogive.org</a></h4>
			</div>

			{basket? <Misc.SavePublishDiscard type={C.TYPES.Basket} id={getId(basket)} hidden /> : null}
		</div>
	);
};

const Card = ({basket, ticket, event}) => {
	const pvCharity = ActionMan.getDataItem({type:C.TYPES.NGO, id:ticket.charityId, status:C.KStatus.PUBLISHED});
	let charityName = pvCharity.value ? pvCharity.value.name : ticket.charityId;

	const addTicketAction = () => {
		ActionMan.addToBasket(basket, ticket);
		modifyHash(['checkout', event.id]);
	};

	return (<div className='XmasCard well'>
		<h3>{ticket.name}</h3>
		<h4 className='subtitle'>{ticket.subtitle}</h4>
		<img src={ticket.attendeeIcon} className='xmas-card-preview-img' />
		<p>Charity funded: <a href={'/#charity?charityId='+encURI(ticket.charityId)}>{charityName}</a></p>
		<p>{ticket.description}</p>
		<center><BS.Button size='lg' color='primary' onClick={addTicketAction}>Buy One</BS.Button></center>
	</div>);
};

export default CardShopPage;
