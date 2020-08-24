import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import { Alert, Card as BSCard } from 'reactstrap';
import printer from '../../base/utils/printer.js';
import { modifyHash } from '../../base/utils/miscutils';

import C from '../../C';
import Roles from '../../base/Roles';
import Misc from '../../base/components/Misc';
import PropControl from '../../base/components/PropControl';
import DataStore, {getPath} from '../../base/plumbing/DataStore';
import ServerIO from '../../plumbing/ServerIO';
import ActionMan from '../../plumbing/ActionMan';
import {getType, getId, nonce} from '../../base/data/DataClass';
import Ticket from '../../data/charity/Ticket';
import Donation from '../../data/charity/Donation';
import Event from '../../data/charity/Event';
import ListLoad, {CreateButton} from '../../base/components/ListLoad';
import ShareWidget, {canWrite, AccessDenied, ShareLink} from '../../base/components/ShareWidget';
import {SuggestedDonationEditor} from './CommonControls';
import Money from '../../base/data/Money.js';

const EditEventPage = () => {
	// which event?
	let path = DataStore.getValue(['location','path']);
	let eventId = path[1];
	if ( ! eventId) {
		return <Alert>Missing: Event ID</Alert>;
	}
	let type = C.TYPES.Event;
	let pvCanWrite = canWrite(type, eventId);

	let isAdmin = Roles.iCan(C.CAN.admin);
	isAdmin = isAdmin && isAdmin.value;

	if ( ! Login.isLoggedIn()) {
		return <Alert color="warning"><h3>Please login</h3></Alert>;
	}
	if ( ! pvCanWrite.resolved) {
		return <Misc.Loading text="Checking editing rights" />;
	}
	if ( ! pvCanWrite.value && ! isAdmin ) {
		return <AccessDenied thingId={eventId} />;
	}
	if (eventId) return <EventEditor id={eventId} />;
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
		const tt = new Ticket({eventId: item.id});
		item.ticketTypes = (item.ticketTypes || []).concat(tt);
		DataStore.update();
	};
	// start with one default ticket
	if ( ! item.ticketTypes) {
		const tt = new Ticket({eventId: item.id, name:"Standard Ticket"});
		item.ticketTypes = [tt];
	}
	// merchandise
	const addExtra = () => {
		const tt = new Ticket({eventId: item.id});
		item.extras = (item.extras || []).concat(tt);
		DataStore.update();
	};

	/**
	 * alter the ticket order
	 */
	const move = (i, di) => {
		// swap
		let ta = item.ticketTypes[i];
		let tb = item.ticketTypes[i+di];
		assert(ta && tb, "EditEventPage.js - move");
		item.ticketTypes[i] = tb;
		item.ticketTypes[i+di] = ta;
		DataStore.update();
	};

	const path = DataStore.getDataPath({status:C.KStatus.DRAFT, type, id});
	return (<div>
		<h2>Event {item.name || id} </h2>
		<div><a href={"/#event/"+escape(id)}>View event</a></div>
		<small>ID: {id}</small>
		
		<Misc.Card title='Event Details'>
			<PropControl path={path} prop='name' item={item} label='Event Name' />

			<PropControl path={path} prop='date' item={item} label='Event Date' type='date'
				validator={ (v, rawValue) => {
					if ( ! v) {
						// raw but no date suggests the server removed it
						if (rawValue) return 'Please use the date format yyyy-mm-dd';
						return null;
					}
					try {
						let sdate = "" + new Date(v);
						if (sdate === 'Invalid Date' || !v.match(/[0-9]{4}(-|\/)[0-9]{2}(-|\/)[0-9]{2}/)) {
							return 'Please use the date format yyyy-mm-dd';
						}
					} catch (er) {
						return 'Please use the date format yyyy-mm-dd';
					}
				} }
			/>
			
			<PropControl path={path} prop='country' item={item} label='Country' type='country' required={false}
				help={`This sets the default currency (currently: ${Money.CURRENCY_FOR_COUNTRY[item.country] || 'GBP'}). 
				Use a two-letter ISO 3166 code, e.g. Britain is "GB"`}
			/>
			<div><small>Currency: </small></div>			
			
			<PropControl path={path} prop='description' item={item} label='Description' type='textarea' />

			<PropControl path={path} prop='url' item={item} label='Event web-page' type='url' />

			<PropControl path={path} prop='perPersonTarget' item={item} label='How much should each participant raise?' type='Money' />

			<PropControl path={path} prop='target' item={item} label='Overall event target?' type='Money' />
			<PropControl path={path} prop='pickCharity' item={item}
				label='Allow users to pick their charity?' type='checkbox'
				dflt
			/>

			{/* TODO a nice charity picker like RegisterPage.jsx CharityChoiceTab */}
			<PropControl path={path} prop='charityId' item={item}
				label='Charity ID' />

			<PropControl path={path} prop='teams' item={item}
				label='User teams?' type='checkbox' />
		</Misc.Card>

		<Misc.Card icon='camera' title='Images & Branding'>
			<PropControl path={path} prop='backgroundImage' item={item} label='Event Page Backdrop' type='imgUpload' />
			
			<PropControl path={path} prop='logoImage' item={item} label='Square Logo Image' type='imgUpload' />

			<PropControl path={path} prop='bannerImage' item={item} label='Banner Image (suggested width: 600px)' type='imgUpload' />

			<PropControl path={path} prop='customCSS' item={item} label='Custom CSS' type='textarea'
				help='Use for advanced styling edits. This also propagates to all fundraiser pages for this event.' />
		</Misc.Card>

		<Misc.Card title='Ticket Types' icon='ticket' warning={item.ticketTypes? null : "Define a ticket type so people can register for your event"}>
			{item.ticketTypes? item.ticketTypes.map( (tt, i) =>
				<TicketTypeEditor key={'tt'+i} i={i} path={path.concat(['ticketTypes', i])} ticketType={tt} event={item} move={move} last={i + 1 === item.ticketTypes.length} />)
				: <p>No tickets yet!</p>
			}
			<hr/>
			<button className='btn btn-default' onClick={addTicketType} type="button"><Misc.Icon prefix="fas" fa="plus" /> Create</button>
		</Misc.Card>

		<Misc.Card title='Suggested Donation'>
			<Misc.ListEditor path={path.concat('suggestedDonations')} ItemEditor={SuggestedDonationEditor} />
		</Misc.Card>

		<Misc.Card title='Merchandise & Extras' icon='gift'>
			{item.extras? item.extras.map( (tt, i) =>
				<ExtraEditor key={'tt'+i} i={i} path={path.concat(['extra', i])} extra={tt} event={item} move={move} last={i + 1 === item.extras.length} />)
				: <p>No extras yet!</p>
			}
			<button className='btn btn-default' onClick={addExtra} type="button"><Misc.Icon prefix="fas" fa="plus" /> Create</button>
		</Misc.Card>

		<Misc.Card title='Advanced Options'>
			<PropControl path={path} prop='matchedFunding' item={item} label='Matched funding? e.g. enter 40 for 40% for The Kiltwalk'
				type='number' />

			<PropControl path={path} prop='matchedFundingSponsor' item={item} label='If there is matched funding - who is the sponsor?' />

			<PropControl path={path} prop='shareDonorsWithOrganiser' item={item} label='Anonymous donors: Share details with event organiser'
				type='checkbox' help="If set, the organiser (that's probably you!) will get name and email details for <i>all</i> donors. Donors will be informed of this when making a donation. Only tick this if you need those details. You will be responsible for handling their personal data correctly." />

			<PropControl path={path} prop='allowOngoingDonations' item={item} label='Allow donations which repeat after the event'
				type='checkbox' />
		</Misc.Card>

		<div>
			<ShareLink item={item} />
			<ShareWidget item={item} />
			<div><br/><br/>{/* a bit of whitespace at the page bottom*/}</div>
		</div>
		<Misc.SavePublishDiscard type={type} id={id} />
	</div>);
}; // ./EventEditor

const TicketTypeEditor = ({ticketType, path, event, i, move, last}) => {
	const removeTicketType = () => {
		event.ticketTypes = event.ticketTypes.filter(tt => tt !== ticketType);
		DataStore.update();
	};
	return (<BSCard body>
		<small>{ticketType.id}</small>
		<PropControl item={ticketType} path={path} prop='name' label='Name' placeholder='e.g. The Wee Wander' />
		<PropControl item={ticketType} path={path} prop='subtitle' label='SubTitle' placeholder='e.g. a 10 mile gentle walk' />
		<PropControl item={ticketType} path={path} prop='kind' label='Kind' placeholder='e.g. Adult / Child / Card'
			help="'Card' is a special value for setting up charity Xmas Cards" />
		
		<PropControl path={path} prop='charityId' label='Charity ID' disabled={Event.charityId(event)}
			placeholder='Link a charity to this ticket'
		/>

		<PropControl type='Money' item={ticketType} path={path} prop='price' label='Price' />
		<Misc.Col2>
			<div>
				<PropControl type='number' item={ticketType} path={path} prop='stock' label='Stock'
					help='The maximum number that can be sold - normally left blank for unlimited' />
				<PropControl type='checkbox' item={ticketType} path={path} prop='inviteOnly' label='Invite only'
					help='TODO only those invited by the organiser can attend' />
			</div>
			<div><label>Sold so far: {ticketType.sold || 0}</label></div>
		</Misc.Col2>
		<PropControl type='text' item={ticketType} path={path} prop='description' label='Description' />
		<PropControl type='text' item={ticketType} path={path} prop='attendeeNoun' label='Attendee Noun' placeholder='e.g. Walker' />
		<PropControl type='imgUpload' item={ticketType} path={path} prop='attendeeIcon' label='Attendee Icon' />
		<PropControl type='url' item={ticketType} path={path} prop='postPurchaseLink' label='Post-purchase link' placeholder='leave blank for setup-your-fundraiser' />
		<PropControl type='text' item={ticketType} path={path} prop='postPurchaseCTA' label='Post-purchase CTA' placeholder='leave blank for default behaviour' />
		<button disabled={i===0} className='btn btn-default' onClick={() => move(i, -1)}><Misc.Icon prefix="fas" fa="arrow-up" /> up</button>
		<button disabled={last} className='btn btn-default' onClick={() => move(i, 1)}><Misc.Icon prefix="fas" fa="arrow-down" /> down</button>
		<button className='btn btn-danger' onClick={removeTicketType}><Misc.Icon prefix="fas" fa="trash" /></button>
	</BSCard>);
};

// copy pasta of TicketTypeEditor. We could refactor. We could use ListLoad. But prob copy-paste is optimal for time.
const ExtraEditor = ({extra, path, event, i, move, last}) => {
	const removeThing = () => {
		event.extras = event.extras.filter(tt => tt !== extra);
		DataStore.update();
	};
	return (<BSCard body>
		<small>{getId(extra)}</small>
		<PropControl item={extra} path={path} prop='name' label='Name' placeholder='e.g. Event T-Shirt' />
		<PropControl item={extra} path={path} prop='subtitle' label='SubTitle' placeholder='' />
		<PropControl type='Money' item={extra} path={path} prop='price' label='Price' />
		<PropControl type='text' item={extra} path={path} prop='description' label='Description' />
		<Misc.Col2>
			<PropControl type='text' item={extra} path={path} prop='stock' label='Stock' help='The maximum number that can be sold' />
			<div><label>Sold so far: {extra.sold || 0}</label></div>
		</Misc.Col2>
		<button disabled={i===0} className='btn btn-default' onClick={() => move(i, -1)}><Misc.Icon prefix="fas" fa="arrow-up" /> up</button>
		<button disabled={last} className='btn btn-default' onClick={() => move(i, 1)}><Misc.Icon prefix="fas" fa="arrow-down" /> down</button>
		<button className='btn btn-danger' onClick={removeThing}><Misc.Icon prefix="fas" fa="trash" /></button>
	</BSCard>);
};

export default EditEventPage;
