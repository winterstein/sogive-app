import React from 'react';
import ReactDOM from 'react-dom';

import { Well, Button, Label } from 'react-bootstrap';

import SJTest, {assert} from 'sjtest';
import {XId, encURI} from 'wwutils';
import Login from 'you-again';
import printer from '../utils/printer.js';
import C from '../C';
import DataStore from '../plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import ServerIO from '../plumbing/ServerIO';
import { getId, getType } from '../data/DataClass';
import Basket from '../data/Basket';
import FundRaiser from '../data/charity/FundRaiser';
import { SearchResults } from './SearchPage';
import Roles from '../Roles';
import Misc from './Misc';
import GiftAidForm from './GiftAidForm';
import { LoginWidgetEmbed } from './LoginWidget/LoginWidget';
import NewDonationForm from './NewDonationForm';
import WizardProgressWidget, {WizardStage} from './WizardProgressWidget';
import PaymentWidget from './PaymentWidget';

/**
 * Sign up for an event!
 */
const RegisterPage = () => {
	let eventId = DataStore.getValue('location', 'path')[1];
	const pvEvent = ActionMan.getDataItem({type:C.TYPES.Event, id:eventId, status:C.KStatus.PUBLISHED});
	if ( ! pvEvent.value) return <Misc.Loading />;
	const event = pvEvent.value;

	const wspath = ['widget', 'RegisterPage', eventId];
	const widgetState = DataStore.getValue(wspath) || {};
	const stagePath = wspath.concat('stage');
	let stage = widgetState.stage || 0;
	// if (stage===0) { // start on 1
	// 	stage = 1;
	// 	DataStore.setValue(stagePath, stage, false);
	// }

	const pvbasket = ActionMan.getBasketPV();
	const basket = pvbasket.value;
	console.log('pvbasket', pvbasket);

	if (!basket) {
		return <Misc.Loading text='Retrieving your basket...' />;
	}
	
	const basketPath = ActionMan.getBasketPath();

	return (
		<div className=''>
			<h2>Register &amp; get tickets for {event.name}</h2>

			<WizardProgressWidget stageNum={stage} 
				stagePath={stagePath}
				stages={[{title:'Tickets'}, {title:'Register'}, {title:'Your Details'}, {title:'Your Charity'}, 
					{title:'Checkout'}, {title:'Confirmation'}]}			
			/>

			<WizardStage stageKey={0} stageNum={stage}>					
				{event.ticketTypes.map((tt,ti) => <RegisterTicket key={ti} event={event} ticketType={tt} basket={basket} />)}
				<NextTab stagePath={stagePath} disabled={ ! basket || ! Basket.getItems(basket).length} completed={basket && Basket.getItems(basket).length} />
			</WizardStage>
			<WizardStage stageKey={1} stageNum={stage}>
				<RegisterOrLoginTab />
				<PreviousTab stagePath={stagePath} /> 
				<NextTab stagePath={stagePath} disabled={ ! Login.isLoggedIn()} completed={Login.isLoggedIn()} />
			</WizardStage>
			<WizardStage stageKey={2} stageNum={stage}>
				<WalkerDetailsTab basket={basket} basketPath={basketPath} />
				<PreviousTab stagePath={stagePath} /> 
				<NextTab stagePath={stagePath} />
			</WizardStage>
			<WizardStage stageKey={3} stageNum={stage}>					
				<CharityChoiceTab basket={basket} />
				<PreviousTab stagePath={stagePath} /> 
				<NextTab stagePath={stagePath} completed={ !! basket.charity} />
			</WizardStage>
			<WizardStage stageKey={4} stageNum={stage}>					
				<CheckoutTab basket={basket} event={event} />
				<PreviousTab stagePath={stagePath} />
			</WizardStage>
			<WizardStage stageKey={5} stageNum={stage}>	
				ticket list, receipt, print button
				CTA(s) to go to your shiny new fundraising page(s)
				<ConfirmedTicketList basket={basket} event={event} />
			</WizardStage>

			{basket? <Misc.SavePublishDiscard type={C.TYPES.Basket} id={getId(basket)} /> : null}

		</div>
	);
};

const NextTab = ({stagePath, disabled, completed}) => {
	return (<button className={completed? 'btn btn-primary' : 'btn btn-default'} onClick={() => {
		let n = DataStore.getValue(stagePath) + 1;
		DataStore.setValue(stagePath, n);
	}} disabled={disabled} >Next</button>);
};
const PreviousTab = ({stagePath}) => {
	return (<button className='btn btn-default' onClick={() => {
		let n = DataStore.getValue(stagePath) - 1;
		DataStore.setValue(stagePath, n);
	}} >Previous</button>);
};

const RegisterTicket = ({event, ticketType, basket}) => {
	// TODO put cloned objects into the basket, so we can extra details to them (names & addresses) on a per-ticket basis	
	let tickets = basket? Basket.getItems(basket).filter(tkt => getId(tkt) === getId(ticketType)) : [];
	return (<div>		
		<button onClick={() => ActionMan.addToBasket(basket, ticketType)} disabled={ ! basket }>
			{ticketType.name} <Misc.Money amount={ticketType.price} />
		</button>
		{tickets.length? 
			<div>{tickets.length} <button title='Cancel a ticket' onClick={() => ActionMan.removeFromBasket(basket, tickets[tickets.length-1])} >
				<Misc.Icon glyph='minus' />
			</button></div> 
			: null}
	</div>);
};

const RegisterOrLoginTab = () => {
	if (Login.isLoggedIn()) {
		return (
			<div>
				<Misc.Icon glyph='tick' className='text-success' />
				<p>You're logged in as <Label title={Login.getId()}>{Login.getUser().name || Login.getId()}</Label>.</p>
				<p>Not you? <Button bsSize='small' onClick={() => Login.logout()}>Log out</Button></p>
			</div>
		);
	}
	return (
		<div>
			<p>Please login or register your account.</p>
			<LoginWidgetEmbed services={['twitter']} />
		</div>
	);
};


const WalkerDetailsTab = ({basket, basketPath}) => {
	if ( ! basket) return null;
	assert(basketPath);
	// No sort on Tickets -- so that the editor can adjust ordering (eg by name / kind, alphabetical, or walk-length, or whatever)
	let items = Basket.getItems(basket); //.sort((a, b) => a.name > b.name);
	if ( ! items.length) return null;
	let ticket0 = items[0];
	let wdetails = items.map((ticket, ti) => {
		const ticketPath = [...basketPath, 'items', ti];
		return (<AttendeeDetails key={ti} ticket={ticket} i={ti} path={ticketPath} ticket0={ticket0} />);
	});
	return <div>{wdetails}</div>;
};

const AttendeeDetails = ({i, ticket, path, ticket0}) => {
	assert(DataStore.getValue(path) === null || DataStore.getValue(path) === ticket, "RegisterPage.js - "+path+" "+ticket+" "+DataStore.getValue(path));
	const noun = ticket.attendeeNoun || 'Attendee';
	// first ticket - fill in from user details
	if (i===0 && ! ticket.attendeeName && ! ticket.attendeeEmail && Login.isLoggedIn()) {
		const user = Login.getUser();
		ticket.attendeeName = user.name;
		if (XId.service(user.xid) === 'email') ticket.attendeeEmail = XId.id(user.xid);
		console.log("set name,email from Login", ticket, user.xid);
		DataStore.setValue(path, ticket, false);
	}
	// other tickets - fill in from first ticket
	if (i>0 && ticket.sameAsFirst) {
		ticket.attendeeAddress = ticket0.attendeeAddress;
		ticket.team = ticket0.team;
	}
	return (
		<div className='AttendeeDetails'>
			<h3 className='name'>{ticket.name}</h3><h4>{ticket.subtitle}</h4><h4 className='kind'>{ticket.kind}</h4>			
			<h4>{noun} <span>{i+1}</span></h4>
			<Misc.PropControl type='text' item={ticket} path={path} prop='attendeeName' label={`${noun} Name`} />
			<Misc.PropControl type='text' item={ticket} path={path} prop='attendeeEmail' label='Email' />
			{ i!==0? <Misc.PropControl type='checkbox' path={path} prop='sameAsFirst' label='Same address as first walker' /> : null}
			{ ticket.sameAsFirst && i !== 0 ? null : 
				<div>
					<Misc.PropControl type='textarea' path={path} prop='attendeeAddress' label='Address' />
					<TeamControl ticket={ticket} path={path} />
				</div>
			}
		</div>
	);
};

const TeamControl = ({ticket, path}) => {
	return <Misc.PropControl type='text' item={ticket} path={path} prop='team' label='Team' />;
};

const CharityChoiceTab = ({basket}) => {
	if ( ! basket) return null;
	const bpath = ActionMan.getBasketPath();
	// const pvCharities = DataStore.fetch([], () => {
	// 		ServerIO.search({q: query, from, size: RESULTS_PER_PAGE, status, recommended})
	// 		.then(function(res) {
	// 		})
	// 	}
	// );
		// results={charities} total={total} from={from} query={q} 
		// all={this.state.all} recommended={recommended}

	return (<div>
		<p>
			Please choose a charity to support.
		</p>
		<Misc.PropControl label='My Charity' item={basket} path={bpath} prop='charity' 	
			type='autocomplete'
			modelValueFromInput={v => v}
			getItemValue={item => { console.warn("getItemValue", item); return getId(item) || 'no id'; }}
			renderItem={(item, isHighlighted) => {
				console.warn("renderItem", item);
				return (<div className={isHighlighted? 'highlighted autocomplete-option' : 'autocomplete-option'} 
					style={{ background: isHighlighted? 'lightgray' : 'white' }} 
				>
					{item.name || getId(item)}
				</div>); 
			}}
			options={val => {
				console.warn("fetch options for "+val);
				// FIXME prefix handling!
				return ServerIO.search({prefix: val, size:20})
					.then(res => {
						console.warn("autocomp", res);
						let opts = res.cargo && res.cargo.hits; // [{'@id':'oxfam','id':'oxfam'}];
						return opts;
					});
			}}
		/>

			Let's reuse SearchResults 

			show some recommended charities
		</div>
	);
};

const CheckoutTab = ({basket, event}) => {
	if (!basket) return <Misc.Loading />;

	const onToken = (token, ...data) => {
		console.log('CheckoutTab got token back from PaymentWidget:', token);
		console.log('CheckoutTab got other data:', data);
	};
	return <PaymentWidget amount={Basket.getTotal(basket)} onToken={onToken} recipient={event.name} />;
};

const ConfirmedTicketList = ({basket, event}) => {
	if ( ! basket) return null;
	let tickets = Basket.getItems(basket);
	return (
		<div className='ConfirmedTicketList'>
			{tickets.map( (ticket, ti) => <ConfirmedTicket key={ti} ticket={ticket} event={event} /> )}
		</div>
	);
};

const ConfirmedTicket = ({ticket, event}) => {
	if ( ! ticket.event) ticket.event = getId(event);
	let frid = FundRaiser.getIdForTicket(ticket);	
	return (
		<div>
			<h3>{ticket.attendeeName}</h3>
			<a href={'#fundraiser/'+encURI(frid)}
				onClick={() => {
					// HACK create!
					let fritem = FundRaiser.make({id:frid, event:getId(event)});
					ActionMan.crud(C.TYPES.FundRaiser, frid, C.CRUDACTION.new, fritem);
				}}
			>Fund Raiser for {ticket.attendeeName}</a>
			<pre>{JSON.stringify(ticket)}</pre>
		</div>
	);
};

export default RegisterPage;
