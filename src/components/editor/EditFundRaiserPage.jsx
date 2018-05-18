import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert, assMatch} from 'sjtest';
import Login from 'you-again';
import {encURI} from 'wwutils';

import ActionMan from '../../plumbing/ActionMan';
import DataStore from '../../base/plumbing/DataStore';
import C from '../../C';
import Roles from '../../base/Roles';

import Misc from '../../base/components/Misc';
import FundRaiser from '../../data/charity/FundRaiser';
import NewDonationForm, {DonateButton} from '../NewDonationForm';
import ShareWidget, {ShareLink, canWrite} from '../../base/components/ShareWidget';
import {notifyUser} from '../../base/plumbing/Messaging';

const EditFundRaiserPage = () => {

	// which event?	
	let path = DataStore.getValue(['location','path']);
	let id = path[1];
	if (id) return <FundRaiserEditor id={id} />;

	return (
		<div className=''>
			<h2>Edit your fundraiser (later)</h2>
		</div>
	);
};

const FundRaiserEditor = ({id}) => {
	assMatch(id, String);
	let type = C.TYPES.FundRaiser;
	let pEvent = ActionMan.getDataItem({type, id, status: C.KStatus.DRAFT});
	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	console.warn("pEvent", pEvent.value);
	let item = pEvent.value;
	FundRaiser.assIsa(item);	

	let pvcw = canWrite(id);
	if (pvcw.resolved && ! pvcw.value) {
		notifyUser("Sorry - You cannot edit this.");
	}

	let event = null;
	if (item.eventId) {
		let pvEvent = ActionMan.getDataItem({type: C.TYPES.Event, id: item.eventId, status: C.KStatus.PUBLISHED});
		event = pvEvent.value;
	}

	// TODO charity reuses register form control

	const path = ['data', type, id];
	const peepPath = path.concat('owner');

	return (<div className='padded-page'>
		{event ? <div className='fullwidth-bg' style={{backgroundImage: `url(${event.backgroundImage})`, opacity:0.5}} /> : null}
		<div className='padded-block'>
			<center>
				<h2>Fundraiser for {item.name || id} </h2>
			</center>
			<p className='CTA'><a href={'#fundraiser/'+encURI(id)}>Go to Your FundRaiser Page</a></p>
			<p><small>
				ID: {id} <br/>
				Owner: {FundRaiser.oxid(item)} <br/>
				Event: {FundRaiser.eventId(item)} <br/>
				<ShareLink thingId={id} />
				<ShareWidget thingId={id} name={item.name} />
			</small></p>			
			<Misc.PropControl path={path} prop='name' item={item} label='Fundraiser Name' />
			<Misc.PropControl path={path} prop='img' label='Fundraiser Photo' type='imgUpload' />
			<Misc.PropControl path={path} prop='description' item={item} label='Description' />		
			<Misc.PropControl path={path} prop='charityId' item={item} label='Charity' />
			<Misc.PropControl path={path} prop='userTarget' item={item} label='Fixed £ Target' type='Money' 
				placeholder='Leave blank for an automatic target (recommended)'
			/>			

			<Misc.PropControl path={path} prop='donated' item={item} label='DEBUG: Set donated' type='Money' />
			<Misc.PropControl path={path} prop='donationCount' item={item} label='DEBUG: Set donor count' type='number' />

			<Misc.PropControl path={peepPath} prop='name' label='Your Name' />
			<Misc.PropControl path={peepPath} prop='img' label='Your Photo' type='imgUpload' />
			<Misc.PropControl path={peepPath} prop='description' label='About You' type='textarea' />
			<Misc.PropControl path={path} prop='story' item={item} label='Your Story' type='textarea' />
			<hr />
			<p className='CTA'><a href={'#fundraiser/'+encURI(id)}>Go to Your FundRaiser Page</a></p>

			<AddOffSiteDonation fundraiser={item} />

			<Misc.SavePublishDiscard type={type} id={id} />
			</div>
	</div>);
};

const AddOffSiteDonation = ({fundraiser}) => {
	return (
		<Misc.Card title='Add an off-site donation'>
			<p>Use this form to record a donation which has already been paid for elsewhere. It will be added to your fundraiser.</p>
			<DonateButton item={fundraiser} paidElsewhere />
			<NewDonationForm item={fundraiser} fromEditor />
		</Misc.Card>
	);
};

export default EditFundRaiserPage;
