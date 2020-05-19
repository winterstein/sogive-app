import React from 'react';

import { Jumbotron, Button, Badge } from 'reactstrap';

import { assert } from 'sjtest';
import { encURI } from 'wwutils';
import Login from 'you-again';
import C from '../C';
import DataStore from '../base/plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import { getId } from '../base/data/DataClass';
import Basket from '../data/Basket';
import Event from '../data/charity/Event';
import Ticket from '../data/charity/Ticket';
import Money from '../base/data/Money';
import FundRaiser from '../data/charity/FundRaiser';
import Misc from '../base/components/Misc';
import PropControl from '../base/components/PropControl';
import { LoginWidgetEmbed } from '../base/components/LoginWidget';
import Wizard, {WizardStage} from '../base/components/WizardProgressWidget';
import PaymentWidget from '../base/components/PaymentWidget';
import { defaultCardMessage } from './CardShopPage';
import deepCopy from '../base/utils/deepCopy';

/**
 * Buy cards. Copy pasta from RegisterPage.jsx TODO unify the two
 */
const CheckoutPage = () => {
	const pvbasket = ActionMan.getBasketPV();
	const basket = pvbasket.value;

	if ( ! basket) {
		return <Misc.Loading text='Retrieving your basket...' />;
	}
	const doneBasket = DataStore.getValue(['transient','doneBasket']);

	// Linked to one event / shop?
	let eventId = DataStore.getValue('location', 'path')[1] || Basket.eventId(basket);
	const pvEvent = eventId? ActionMan.getDataItem({type:C.TYPES.Event, id:eventId, status:C.KStatus.PUBLISHED}) : null;
	const event = (pvEvent && pvEvent.value) || {};

	const walkerDetailsOK = Basket.getItems(basket).reduce((done, ticket) => {
		return done && ticket.attendeeName && ticket.attendeeEmail && ticket.attendeeAddress;
	}, true);

	const longdate = event.date? Misc.LongDate({date:event.date}) : null;
	
	const basketPath = ActionMan.getBasketPath();

	const stagePath = ['location', 'params', 'registerStage'];

	const deleteBasket = e => {
		e.preventDefault();
		basket.items = [];
		DataStore.setData(C.KStatus.DRAFT, basket);
	};

	// hacky: set a charity in the basket?
	if ( ! event.pickCharity) {
		const charityId = Event.charityId(event);
		if (charityId) basket.charityId = charityId;
	}

	return (
		<div>
			<div className='fullwidth-bg' style={{backgroundImage: 'url('+event.backgroundImage+')'}} />
			{event.bannerImage? <img className='page-banner' src={event.bannerImage} alt='banner' /> : null}
			<h2 className='page-masthead'>
				<span className='event-name'>{event.name || 'Checkout'}</span>
				&nbsp;
				<br/>
				<span className='event-date'>{longdate}</span>
			</h2>

			<Wizard stagePath={stagePath} nonavButtons >
				<WizardStage title='Tickets'
					sufficient={basket && Basket.getItems(basket).length}
					complete={basket && Basket.getItems(basket).length}
				>
					<TicketTypes event={event} basket={basket} />
					<TicketInvoice event={event} basket={basket} />

					<Button size='sm' className="pull-left" onClick={deleteBasket} >
						<Misc.Icon prefix="fas" fa="trash" />Empty Basket
					</Button>
				</WizardStage>

				<WizardStage title='Register' sufficient={Login.isLoggedIn()} complete={Login.isLoggedIn()} >
					<RegisterOrLoginTab stagePath={stagePath} />
				</WizardStage>

				<WizardStage title='Delivery Details' complete={walkerDetailsOK} sufficient={walkerDetailsOK} >
					<WalkerDetailsTab basket={basket} basketPath={basketPath} />
				</WizardStage>

				<WizardStage title='Checkout' next={false} >
					{ 	// clean out old Minor TODO something is causing a redraw glitch here
						doneBasket && basket && doneBasket.id !== basket.id
							&& DataStore.setValue(['transient', 'doneBasket'], null, false) && null
					}
					<CheckoutTab basket={basket} event={event} stagePath={stagePath} />
				</WizardStage>

				<WizardStage title='Confirmation' previous={false} >
					<BehaviourBasketDone basket={basket} doneBasket={doneBasket} />
					<Receipt basket={doneBasket} event={event} />
					<ConfirmedTicketList basket={doneBasket} event={event} />
				</WizardStage>
			</Wizard>

			{basket? <Misc.SavePublishDiscard type={C.TYPES.Basket} id={getId(basket)} hidden /> : null}
			{event.id? <h4><a href={'#cardshop/'+encURI(event.id)}>Or return to the shop</a></h4> : null}
		</div>
	);
};

const BehaviourBasketDone = ({basket, doneBasket}) => {
	if ( ! basket) return null;
	if (doneBasket) return null;
	// stash for the receipt display
	doneBasket = deepCopy(basket);
	DataStore.setValue(['transient','doneBasket'], doneBasket);
	// empty
	if (basket.id && basket.status===C.KStatus.PUBLISHED) ActionMan.delete(C.TYPES.Basket, basket.id);
	return null;
};

/**
 * 
 * @param {Ticket} ticket
 * @returns {Boolean}
 */
const isGift = ticket => ticket && ticket.kind && ticket.kind.toLowerCase() === 'card';

/**
 * 
 */
const TicketTypes = ({event, basket}) => {
	// Event.assIsa(event); // may be an empty dummy object
	Basket.assIsa(basket);
	if ( ! event.ticketTypes) {
		return null;
	}
	const nameToTickets = {};
	// only show options for +/- if the user has one in their basket
	// -- but show the template to avoid accidentally copying any e.g. message details
	const actualTickets = Basket.getItems(basket);
	let liveTicketTypes = event.ticketTypes.filter(tt => actualTickets.find(at => at.name === tt.name));
	liveTicketTypes.forEach(tt => {
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
		<TicketGroup key={JSON.stringify([name,info])}
			basket={basket} {...info} />
	));

	return (
		<div>
			{ticketGroups}
		</div>
	);

};

/**
 * types: {Ticket[]}
 */
const TicketGroup = ({name, subtitle, types, basket}) => {
	return (
		<div className='ticket-group'>
			<center>
				<h3>{name} <small>{subtitle}</small></h3>
			</center>
			<hr />
			<ul className='ticket-group-types'>
				{ types.map(type => <RegisterTicket key={JSON.stringify(type)} ticketType={type} basket={basket} />) }
			</ul>
		</div>
	);
};

const RegisterTicket = ({ticketType, basket}) => {
	// TODO put cloned objects into the basket, so we can extra details to them (names & addresses) on a per-ticket basis
	const _tickets = Basket.getItems(basket);
	const ttid = getId(ticketType);
	let tickets = basket ? _tickets.filter(tkt => tkt.parentId === ttid) : [];

	const removeTicketAction = () => ActionMan.removeFromBasket(basket, tickets[tickets.length-1]);
	const addTicketAction = () => ActionMan.addToBasket(basket, ticketType);

	const addRemove = tickets.length ? (
		<div className='add-remove-controls btn-group' role="group" aria-label="add remove controls">
			<button type="button" className="btn btn-default btn-square" onClick={removeTicketAction}><Misc.Icon prefix="fas" fa="minus" /></button>
			<span className='ticket-count btn-text'>{tickets.length}</span>
			<button type="button" className="btn btn-default btn-square" onClick={addTicketAction}><Misc.Icon prefix="fas" fa="plus" /></button>
		</div>
	) : (
		<button className='btn btn-default btn-square add-first-ticket' onClick={addTicketAction}>Add</button>
	);

	const {name, description, price, attendeeIcon, kind} = ticketType;

	return (
		<li className='ticket-type'>
			<div className='decoration'>
				<img className='attendee-icon' src={attendeeIcon} alt='' />
			</div>
			<div className='info'>
				<div className='top-line'>
					<div className='type-kind'>{kind || ''}</div>
					<div className='type-price'><Misc.Money amount={price} /></div>
				</div>
				<div className='description'>{description || ''}</div>
			</div>
			<div className='controls'>
				{addRemove}
			</div>
		</li>
	);
};

const TicketInvoice = ({event, basket}) => {
	const idToRow = {};
	console.warn("basket", basket);
	// Group items of same type+kind into rows
	Basket.getItems(basket).forEach(item => {
		const id = item.parentId || item.id;
		let row = idToRow[id];
		if (row) {
			row.count += 1;
			row.cost = Money.add(row.cost, item.price);
		} else {
			idToRow[id] = {
				item,
				label: (item.name || 'Ticket') + (item.kind? ' - '+item.kind : ''), // eg "The Wee Wander - Child"
				count: 1,
				cost: item.price,
			};
		}
	});

	const rows = Object.values(idToRow)
		.sort((a, b) => a.label < b.label);
	const rowElements = rows.map(rowData => <InvoiceRow key={JSON.stringify(rowData)} {...rowData} />);
	
	let total = Basket.getTotal(basket);

	// commented out 'cos (a) causes bugs with empty baskets, and (b) total should be total; anything else is confusing
	// // HACK: Don't include the tip in calculations when you're not showing it!
	// if (!showTip && basket.tip && Money.isa(basket.tip)) {
	// 	total = Money.sub(total, basket.tip);
	// }
	
	const tipRow = (basket.hasTip && Money.isa(basket.tip)) ? (
		<tr>
			<td className='desc-col'>Processing fee</td>
			<td className='amount-col'><Misc.Money amount={basket.tip} /></td>
		</tr>
	) : null;


	return (
		<div className='invoice'>
			<table className='invoice-table'>
				<tbody>
					{rowElements}
					{ tipRow }
					<tr className='total-row'>
						<td className='desc-col' >Total</td>
						<td className='amount-col total-amount'><Misc.Money amount={total} /></td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

const InvoiceRow = ({item, label, count, cost}) => {
	return (
		<tr>
			<td className='desc-col'>{count} {label}</td>
			<td className='amount-col'><Misc.Money amount={cost} /></td>
		</tr>
	);
};

const RegisterOrLoginTab = ({stagePath}) => {
	// Advance to next stage on email login (no easy callback for social login)
	const onLogin = () => {
		let n = DataStore.getValue(stagePath) + 1;
		DataStore.setValue(stagePath, n);
	};

	if (Login.isLoggedIn()) {
		return (
			<div className='login-tab padded-block'>
				<Jumbotron>
					<p><Misc.Icon prefix="fas" fa="ok" className='text-success' /> You're logged in as <Badge title={Login.getId()}>{Login.getUser().name || Login.getId()}</Badge>.</p>
					<p>Not you? <Button onClick={() => Login.logout()}>Log out</Button></p>
				</Jumbotron>
			</div>
		);
	}
	return (
		<div className='login-tab padded-block'>
			<p>Please login or register your account.</p>
			<LoginWidgetEmbed services={['twitter']} onLogin={onLogin} />
		</div>
	);
};


const WalkerDetailsTab = ({basket, basketPath}) => {
	if ( ! basket) return null;
	assert(basketPath, "RegisterPage.jsx - WalkerDetailsTab: "+basketPath);
	// No sort on Tickets -- so that the editor can adjust ordering (eg by name / kind, alphabetical, or walk-length, or whatever)
	let items = Basket.getItems(basket); //.sort((a, b) => a.name > b.name);
	assert(items.length, "WalkerDetailsTab - empty basket! "+JSON.stringify(basket));

	// set ownership of Tickets to the current user
	items.forEach(item => {
		if ( ! item.oxid) item.oxid = Login.getId();
	});

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
	// HACK: unless it is a card
	if (i===0 && ! ticket.attendeeName && ! ticket.attendeeEmail && Login.isLoggedIn() && ! isGift(ticket)) {
		const user = Login.getUser();
		ticket.attendeeName = user.name;
		ticket.attendeeEmail = Login.getEmail();
		console.log("set name,email from Login", ticket, user.xid);
		DataStore.setValue(path, ticket, false);
	}
	// other tickets - fill in from first ticket (default to "yes please")
	if (i>0 && ticket.sameAsFirst===undefined) ticket.sameAsFirst = true;
	let sameAsFirst = i>0 && ticket.sameAsFirst;
	if (sameAsFirst) {
		ticket.attendeeAddress = ticket0.attendeeAddress;
		ticket.team = ticket0.team;
	}
	return (
		<div>
			<center>
				<h3>
					{ticket.name}
					{ticket.kind? <span className='kind'> - {ticket.kind}</span> : null}
				: <span>{noun} {i+1}</span>
				</h3>
			</center>
			<hr />
			<div className='AttendeeDetails'>
				<PropControl type='text' item={ticket} path={path} prop='attendeeName'
					label={noun+' Full Name'} help={isGift()} />
				<PropControl type='text' item={ticket} path={path} prop='attendeeEmail' label={noun+' Email'}
					help="Include their email to also send an e-Card at no extra cost. You can leave this blank if you don't want to do that." />
				{ i!==0? <PropControl type='checkbox' path={path} prop='sameAsFirst' label='Same address as first person' /> : null}
				{ sameAsFirst? null :
					<div>
						<PropControl type='textarea' path={path} prop='attendeeAddress' label='Address' />
					</div>
				}
				{isGift(ticket)?
					<PropControl prop='message' label='Message'
						rows={6}
						help={`Your message to ${ticket.attendeeName || 'them'}, which will be written inside the card. Please include their name and yours.`}
						dflt={defaultCardMessage(ticket)}
						path={path} type='textarea' />
				: null}
			</div>
		</div>
	);
};

/**
 * Login email, or ticket0, or null
 */
const getEmail = (basket) => {
	let e = Login.getEmail();
	if (e) return e;
	// from ticket0?
	let items = Basket.getItems(basket);
	if ( ! items.length) {
		console.warn("getEmail() No email :(", basket);
		return null; // fail!
	}
	return items[0].attendeeEmail;
};

const CheckoutTab = ({basket, event, stagePath}) => {
	if ( ! basket) return <Misc.Loading />;
	if ( ! basket.stripe) basket.stripe = {};

	// does onToken mean on-successful-payment-auth??
	const onToken = (token) => {
		basket.stripe = {
			...basket.stripe,
			...token
		};
		ActionMan.crud({type: C.TYPES.Basket, id:getId(basket), action:C.CRUDACTION.publish, item:basket})
			.then(res => {
				let n = Number.parseInt(DataStore.getValue(stagePath)) + 1;
				DataStore.setValue(stagePath, n);
				DataStore.setUrlValue('registerStage', n);
			}, err => {
				console.error(err); // TODO
			});
	};

	const email = getEmail();

	return (
		<div>
			<TicketInvoice basket={basket} />
			<div className='padded-block'>
				<PaymentWidget
					amount={Basket.getTotal(basket)}
					onToken={onToken}
					recipient={event.name || "Basket"+basket.id}
					email={email}
					username={Login.getId()}
				/>
			</div>
		</div>
	);
};

const Receipt = ({basket, event}) => {
	if ( ! basket) return null; // avoid NPE during race condition
	const items = Basket.getItems(basket);
	const ticket0 = items.length && items[0]; // TODO this is not necc the person who paid
	const stripe = basket.stripe;
	const card = stripe && stripe.card;
	// created will be numeric when returned direct from Stripe but String when retrieved from SoGive
	const createdDate = new Date(Number.parseInt(stripe && stripe.created * 1000));

	return (
		<div>
			<div className='padded-block'>
				<h3>Thank You!</h3>
				<h3>Payment to SoGive Ltd.</h3>
				<p>Registered in England and Wales, company no. 09966206</p>
				{/*<p>Invoice no: TODO</p>*/}
				<p>Event: {event.name}</p>
				{stripe && stripe.created? <p>Payment date & time: {Misc.dateTimeTag(createdDate)}</p> : null}
				<p>Customer name: {ticket0 && ticket0.attendeeName}</p>
				{card? <p>Payment card: **** **** **** {card.last4}</p> : null}
				{basket.paymentId? <p>Payment ID: {basket.paymentId}</p> : null}
			</div>
			<TicketInvoice basket={basket} />
		</div>
	);
};

const ConfirmedTicketList = ({basket, event}) => {
	
	if ( ! basket || ! event ) return null;

	// ID of event that user is registering for
	const {id} = event;

	// Will return false if the user's basket does not contain a ticket for this event
	// Can't imagine how they could manage that, but will add a safety check below
	let ticket = Basket.getItems(basket).find(t => t.eventId === id);

	return (
		<div className='ConfirmedTicketList'>
			{ ticket ? <ConfirmedTicket ticket={ticket} event={event} /> : "Basket does not contain a ticket for this event" }
		</div>
	);
};

// HACK - assumes cards
const ConfirmedTicket = ({ticket, event}) => {
	if ( ! Ticket.eventId(ticket)) ticket.eventId = getId(event);
	// important - duplicated in Java
	let frid = "card."+FundRaiser.getIdForTicket(ticket);
	
	// claim ownership (NB: avoid repeat calls to go easy on the server. This is idempotent - repeat calls would fail harmlessly).
	if (frid && ! DataStore.getValue(['misc','claimFlag', frid])) {
		Login.claim(frid);
		DataStore.setValue(['misc','claimFlag', frid], true, false);
	}

	return (<div className='clear padded-block'>
		<Misc.Col2>
			<h3>{ticket.attendeeName}</h3>
			<div>
				{ ticket.attendeeEmail && "An e-Card will be sent. "
					// <a className='btn btn-primary btn-lg' href={'#card/'+encURI(frid)}>
					// 	Preview e-Card
					// </a>
					// : <p>No email provided</p>
				}
				{ticket.attendeeAddress && "A physical card will be posted. "}
			</div>
		</Misc.Col2>
	</div>);
};

export default CheckoutPage;
