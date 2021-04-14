import React from 'react';
import ReactDOM from 'react-dom';

import MDText from '../base/components/MDText'

import XId from '../base/data/XId';
import {encURI, modifyHash, uid, yessy } from '../base/utils/miscutils';

import printer from '../base/utils/printer.js';
import C from '../C';
import Roles from '../base/Roles';
import Misc from '../base/components/Misc';
import DataStore from '../base/plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import {getType, getId, nonce} from '../base/data/DataClass';
import ListLoad, {CreateButton} from '../base/components/ListLoad';
import FundRaiser from '../data/charity/FundRaiser';
import Money from '../base/data/Money';
import CSS from '../base/components/CSS';

const EventPage = () => {
	// which event?
	let path = DataStore.getValue(['location','path']);
	let eventId = path[1];
	if (eventId) {
		return <Event id={eventId} />;
	}
	// list
	let type = C.TYPES.Event;
	let pvCanEdit = Roles.iCan(C.CAN.editEvent);
	return (
		<div>
			<h2>Pick an Event</h2>
			<ListLoad type={type} status={C.KStatus.PUBLISHED} canFilter />
			{pvCanEdit.value? <div><h4>Draft Events</h4>
				<ListLoad type={type} status={C.KStatus.DRAFT} />
				<CreateButton type={type} navpage='editEvent' />
			</div>
				: null}
		</div>
	);
};

const Event = ({id}) => {
	let type = C.TYPES.Event;
	let pEvent = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.DRAFT});

	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	let item = pEvent.value;
	let logo = item.logoImage || item.img;
	let canEdit = Roles.iCan(C.CAN.editEvent).value;
	let pstyle = {backgroundImage: item.backgroundImage? 'url('+item.backgroundImage+')' : null};

	return (<>
		<CSS css={item.customCSS} />
		<div className='fullwidth-bg' style={pstyle} />
		<div className="col-md-8 col-md-offset-2 well" style={{marginTop:'2vh'}}>
			{item.bannerImage? <img src={item.bannerImage} style={{width:'100%', maxHeight:'50vh'}} alt='event banner' /> : null}
			<h2>{item.name || 'Event '+id}</h2>
			{logo? <img src={logo} className='pull-right logo-xlarge img-thumbnail' alt='event logo' /> : null}
			
			{item.date? <center><Misc.LongDate date={item.date} /></center> : null}
			{item.description? <MDText source={item.description} /> : null}
			{item.url? <div><a href={item.url}>Event website</a></div> : null}

			{item.backgroundImage? <img src={item.backgroundImage} className='img-thumbnail' width='200px' /> : null}

			{canEdit? <div className='pull-right'><small><a href={modifyHash(['editEvent',id], null, true)}>edit</a></small></div> : null}
			
			<FundRaiserList event={item} eventId={id} />
		</div>
	</>);
};


const FundRaiserList = ({event, eventId}) => {
	let allFundraisers = Object.values(DataStore.getValue(['data',C.TYPES.FundRaiser]) || {});
	let ourFundraisers = allFundraisers.filter(
		f => FundRaiser.eventId(f)===eventId && (FundRaiser.status(f)===C.KStatus.PUBLISHED || FundRaiser.status(f)===C.KStatus.PUBLISHED)
	);
	let total = Money.total(ourFundraisers.map(FundRaiser.donated));
	let q = "eventId:"+eventId;
	let sort = null;
	// let ListItem =
	return (<div>
		<h3>Participants and Fund-Raising Pages</h3>

		<Register event={event} />

		{Money.value(total)? <h4>Total raised so far: <Misc.Money amount={total} />...</h4> : null}
		<ListLoad type={C.TYPES.FundRaiser}
			servlet='fundraiser'
			navpage='fundraiser'
			status={C.KStatus.PUBLISHED} q={q}
			hasFilter={false}
			checkboxes={false} canDelete={false} canCreate={false}
		/>
	</div>);
};


const Register = ({event}) => {
	assert(event);
	// No tickets? = no registration
	if ( ! yessy(event.ticketTypes)) {
		return null;
	}
	// published?
	if (false && event.status !== C.KStatus.PUBLISHED) {
		return (<center><a title='This is a draft - you can only register from the published event page' className='btn btn-lg btn-primary disabled'>Register</a></center>);
	}
	// just a big CTA
	return (<center style={{margin:'10px'}}><a href={'#register/'+getId(event)} className='btn btn-lg btn-primary'>Join in - Register Here</a></center>);
};


export default EventPage;
