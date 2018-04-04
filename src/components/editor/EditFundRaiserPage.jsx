import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert, assMatch} from 'sjtest';
import Login from 'you-again';
import {encURI} from 'wwutils';

import ActionMan from '../../plumbing/ActionMan';
import DataStore from '../../plumbing/DataStore';
import C from '../../C';
import Roles from '../../Roles';

import {Loading, PropControl, SavePublishDiscard} from '../Misc';
import FundRaiser from '../../data/charity/FundRaiser';

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
		return <Loading />;
	}
	console.warn("pEvent", pEvent.value);
	let item = pEvent.value;
	FundRaiser.assIsa(item);	

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
			<p><small>ID: {id}</small></p>
			<p><small>Owner: {FundRaiser.oxid(item)}</small></p>
			<p><small>Event: {FundRaiser.eventId(item)}</small></p>

			<PropControl path={path} prop='name' item={item} label='Fundraiser Name' />
			<PropControl path={path} prop='img' label='Fundraiser Photo' type='imgUpload' />
			<PropControl path={path} prop='description' item={item} label='Description' />		
			<PropControl path={path} prop='charityId' item={item} label='Charity' />
			<PropControl path={path} prop='userTarget' item={item} label='Fixed £ Target' type='Money' 
				placeholder='Leave blank for an automatic target (recommended)'
			/>

			<PropControl path={path} prop='donated' item={item} label='DEBUG: Set donated' type='Money' />

			<PropControl path={peepPath} prop='name' label='Your Name' />
			<PropControl path={peepPath} prop='img' label='Your Photo' type='imgUpload' />
			<PropControl path={peepPath} prop='description' label='About You' type='textarea' />
			<PropControl path={path} prop='story' item={item} label='Your Story' type='textarea' />
			<hr />
			<p className='CTA'><a href={'#fundraiser/'+encURI(id)}>Go to Your FundRaiser Page</a></p>

			<SavePublishDiscard type={type} id={id} />
			</div>
	</div>);
};

export default EditFundRaiserPage;
