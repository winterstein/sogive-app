import React from 'react';

import { encURI, } from '../../base/utils/miscutils';


import ActionMan from '../../plumbing/ActionMan';
import DataStore from '../../base/plumbing/DataStore';
import C from '../../C';

import Misc from '../../base/components/Misc';
import PropControl from '../../base/components/PropControl';
import FundRaiser from '../../data/charity/FundRaiser';
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

	let pvcw = canWrite(type, id);
	if (pvcw.resolved && ! pvcw.value) {
		notifyUser("Sorry - You cannot edit this. "+id+" ");
	}

	let event = null;
	const eid = FundRaiser.eventId(item);
	if (eid) {
		let pvEvent = ActionMan.getDataItem({type: C.TYPES.Event, id: eid, status: C.KStatus.PUBLISHED});
		event = pvEvent.value;
	}

	// TODO charity reuses register form control

	const path = DataStore.getDataPath({status:C.KStatus.DRAFT, type, id});
	const peepPath = path.concat('owner');

	return (
		<div className='padded-page'>
			{event ? <div className='fullwidth-bg' style={{backgroundImage: `url(${event.backgroundImage})`, opacity:0.5}} /> : null}
			<div className='padded-block'>
				<center>
					<h2>Fundraiser for {item.name || id} </h2>
				</center>
				<p className='CTA'><a href={'#fundraiser/'+encURI(id)}>Go to Your FundRaiser Page</a></p>
				<p><small>
					ID: {id} <br/>
					Owner: {FundRaiser.oxid(item)} <br/>
					Event: <a href={'#event/'+encURI(eid)}>{eid}</a> <br/>
					<ShareLink item={item} />
					<ShareWidget item={item} />
				</small></p>
				<PropControl path={path} prop='name' item={item} label='Fundraiser Name' />
				<PropControl path={path} prop='img' label='Fundraiser Photo' type='imgUpload' />
				<PropControl path={path} prop='description' item={item} label='Description' />
				<PropControl path={path} prop='charityId' item={item} label='Charity' />
				<PropControl path={path} prop='userTarget' item={item} label='Fixed £ Target' type='Money'
					placeholder='Leave blank for an automatic target (recommended). Set to -1 to switch off the targets.'
				/>

				<PropControl path={path} prop='donated' item={item} label='DEBUG: Set donated' type='Money' />
				<PropControl path={path} prop='donationCount' item={item} label='DEBUG: Set donor count' type='number' />

				<PropControl path={peepPath} prop='name' label='Your Name' />
				<PropControl path={peepPath} prop='img' label='Your Photo' type='imgUpload' />
				<PropControl path={peepPath} prop='description' label='About You' type='textarea' />
				<PropControl path={path} prop='story' item={item} label='Your Story' type='textarea' />
				<hr />
				<p className='CTA'><a href={'#fundraiser/'+encURI(id)}>Go to Your FundRaiser Page</a></p>

				<AddOffSiteDonation fundraiser={item} />
				{/*
					Publish button disabled if no charity ID has been entered. This doesn't check if the ID is valid or not --
					thought that might exclude smaller, local charities that we don't track.
					*/}
				<Misc.SavePublishDiscard
					type={type}
					id={id}
					cannotPublish={!DataStore.getValue(path.concat('charityId'))}
					publishTooltipText="Please enter the name of the charity that you would like to support"
				/>
			</div>
		</div>);
};

const AddOffSiteDonation = ({fundraiser}) => {
	return (
		<Misc.Card title='Add an off-site donation'>
			<p>Use this form to record a donation which has already been paid for elsewhere. It will be added to your fundraiser.</p>
		</Misc.Card>
	);
};

export default EditFundRaiserPage;
