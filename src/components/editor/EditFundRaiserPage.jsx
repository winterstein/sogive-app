import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import ActionMan from '../../plumbing/ActionMan';
import DataStore from '../../plumbing/DataStore';
import C from '../../C';
import Roles from '../../Roles';

import Misc from '../Misc';
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
	let type = C.TYPES.FundRaiser;
	let pEvent = ActionMan.getDataItem({type, id, status: C.KStatus.DRAFT});
	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	console.warn("pEvent", pEvent.value);
	let item = pEvent.value;
	FundRaiser.assIsa(item);	

	const path = ['data', type, id];
	return (<div>
		<h2>Fundraiser {item.name || id} </h2>		
		<p><small>ID: {id}</small></p>
		<p><small>Owner: {FundRaiser.oxid(item)}</small></p>
		<p><small>Event: {FundRaiser.eventId(item.event)}</small></p>
		<Misc.PropControl path={path} prop='name' item={item} label='Fundraiser Name' />
		<Misc.PropControl path={path} prop='description' item={item} label='Description' />
		<Misc.SavePublishDiscard type={type} id={id} />
	</div>);
};

export default EditFundRaiserPage;
