import React from 'react';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../utils/printer.js';
import DataStore from '../plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import C from '../C';
import Roles from '../Roles';
import Misc from './Misc';
import GiftAidForm from './GiftAidForm';
import NewDonationForm from './NewDonationForm';
import ListLoad from './ListLoad';

const FundRaiserPage = () => {
	// which event?	
	let path = DataStore.getValue(['location','path']);
	let frId = path[1];
	if (frId) return <FundRaiser id={frId} />;
	let type = C.TYPES.FundRaiser;

	// which event?	

	return (
		<div>
			<h2>Pick a Fundraiser</h2>
			<ListLoad type={type} />
			<div><a href='#editEvent'>Create / edit events</a></div>
		</div>
	);
};


const FundRaiser = ({id}) => {
	let type = C.TYPES.FundRaiser;
	let pEvent = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.DRAFT});

	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	let item = pEvent.value;
	return (
		<div>
			<h2>{item.name || 'Fundraiser '+id} </h2>		
			<p><small>ID: {id}</small></p>
			<img src={item.img} className='img-thumbnail' alt='fundraiser pic' />
			<div>
				{item.description}
			</div>
			<NewDonationForm item={item} />
		</div>
	);
};


export default FundRaiserPage;
