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

	const longdate = Misc.LongDate({date:(new Date(event.date))});
	
	const basketPath = ActionMan.getBasketPath();
	return (
		<div className=''>
			<img className='register-banner' src={event.bannerImage} />
			<h2 className='register-masthead'>
				<span className='event-name'>{event.name}</span>
				&nbsp;
				<span className='event-date'>{longdate}</span>
			</h2>

			<WizardProgressWidget stageNum={stage} 
				stagePath={stagePath}
				stages={[{title:'Tickets'}, {title:'Register'}, {title:'Your Details'}, {title:'Your Charity'}, 
					{title:'Checkout'}, {title:'Confirmation'}]}			
			/>

			<WizardStage stageKey={0} stageNum={stage}>
				<TicketTypes event={event} basket={basket} />
				<div className='nav-buttons'>
					<NextTab stagePath={stagePath} disabled={ ! basket || ! Basket.getItems(basket).length} completed={basket && Basket.getItems(basket).length} />
				</div>
			</WizardStage>
			<WizardStage stageKey={1} stageNum={stage}>
				<RegisterOrLoginTab />
				<div className='nav-buttons'>
					<PreviousTab stagePath={stagePath} /> 
					<NextTab stagePath={stagePath} disabled={ ! Login.isLoggedIn()} completed={Login.isLoggedIn()} />
				</div>
			</WizardStage>
			<WizardStage stageKey={2} stageNum={stage}>
				<WalkerDetailsTab basket={basket} basketPath={basketPath} />
				<div className='nav-buttons'>
					<PreviousTab stagePath={stagePath} /> 
					<NextTab stagePath={stagePath} />
				</div>
			</WizardStage>
			<WizardStage stageKey={3} stageNum={stage}>					
				<CharityChoiceTab basket={basket} />
				<div className='nav-buttons'>
					<PreviousTab stagePath={stagePath} /> 
					<NextTab stagePath={stagePath} completed={ !! basket.charity} />
				</div>
			</WizardStage>
			<WizardStage stageKey={4} stageNum={stage}>					
				<CheckoutTab basket={basket} event={event} />
				<div className='nav-buttons'>
					<PreviousTab stagePath={stagePath} />
				</div>
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

const NextTab = ({completed, stagePath, ...rest}) => {
	const className = completed ? 'btn btn-primary' : 'btn btn-default';
	return <NextPrevTab stagePath={stagePath} className={className} diff={1} text={'Next'} {...rest} />;
};
const PreviousTab = ({stagePath, ...rest}) => {
	return <NextPrevTab stagePath={stagePath} className='btn btn-default' diff={-1} text={'Previous'} {...rest} />;
};

const NextPrevTab = ({stagePath, diff, text, ...rest}) => {
	const changeTab = () => {
		let n = DataStore.getValue(stagePath) + diff;
		DataStore.setValue(stagePath, n);
	};

	return (
		<button onClick={changeTab} {...rest} >
			{text}
		</button>
	);
};

const TicketTypes = ({event, basket}) => {
	const nameToTickets = {};
	event.ticketTypes.forEach(tt => {
		const ticketsForName = nameToTickets[tt.name];
		if (ticketsForName && ticketsForName.types) {
			ticketsForName.types.push(tt);
		} else {
			nameToTickets[tt.name] = {
				...tt, // we'll want name, desc, etc - just use the first ticket type as our source of truth
				types: [tt]
			};
		}
	});

	const ticketGroups = Object.entries(nameToTickets).map(([name, info]) => (
		<TicketGroup basket={basket} {...info} />
	));

	return (
		<div>
			{ticketGroups}
		</div>
	);

};

const TicketGroup = ({name, description, types, basket}) => {
	return (
		<div className='ticket-group'>
			<div className='ticket-group-header'>
				<div className='name'>{name}</div>
				<div className='desc'>{description}</div>
			</div>
			<ul className='ticket-group-types'>
				{ types.map(type => <RegisterTicket ticketType={type} basket={basket} />) }
			</ul>
		</div>
	);
};

const RegisterTicket = ({event, ticketType, basket}) => {
	// TODO put cloned objects into the basket, so we can extra details to them (names & addresses) on a per-ticket basis	
	let tickets = basket ? Basket.getItems(basket).filter(tkt => getId(tkt) === getId(ticketType)) : [];

	const removeTicketAction = () => ActionMan.removeFromBasket(basket, tickets[tickets.length-1]);
	const addTicketAction = () => ActionMan.addToBasket(basket, ticketType);

	const addRemove = tickets.length ? (
		<div className='add-remove-controls'>
			<button className='add-remove-ticket' onClick={removeTicketAction}><Misc.Icon glyph='minus' /></button>
			<span className='ticket-count'>{tickets.length}</span>
			<button className='add-remove-ticket' onClick={addTicketAction}><Misc.Icon glyph='plus' /></button>
		</div>
	) : (
		<button className='add-first-ticket' onClick={addTicketAction}>Add</button>
	);

	const {name, description, price, attendeeIcon} = ticketType;

	return (
		<li className='ticket-type'>
			<div className='decoration'>
				<img className='attendee-icon' src={attendeeIcon} />
			</div>
			<div className='info'>
				<div className='top-line'>
					<div className='type-name'>{name}</div>
					<div className='type-price'><Misc.Money amount={price} /></div>
				</div>
				<div className='type-restrictions'>Open to humans only</div>
				<div className='price-breakdown'>we throw 100% of your money in the lake</div>
			</div>
			<div className='controls'>
				{addRemove}
			</div>
		</li>
	);
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
