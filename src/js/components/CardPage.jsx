// @Flow
import React from 'react';
import MDText from '../base/components/MDText';
import ActionMan from '../plumbing/ActionMan';
import DataStore from '../base/plumbing/DataStore';
import C from '../C';
import Misc from '../base/components/Misc';
import {defaultCardMessage} from './CardShopPage';

const CardPage = () => {
	let path = DataStore.getValue(['location','path']);
	let frId = path[1];
	let pvCard = ActionMan.getDataItem({type:C.TYPES.Card, id:frId, status: C.KStatus.PUBLISHED});
	if ( ! pvCard.value) {
		return <Misc.Loading pv={pvCard} />;
	}
	const card = pvCard.value;
	let senderXId = card.sender;
	let pvSender = ActionMan.getDataItem({type:C.TYPES.User, id:senderXId, status:C.KStatus.PUBLISHED});

	if ( ! card.message) {
		card.message = defaultCardMessage(card);
	}

	return (<div>
		<img src={card.img} className='xmas-card-img' />
		
		<div className='message'><MDText source={card.message} /></div>

		{card.toAddress? <p>A physical card is also being posted to you.</p> : null}
		<div><small>Card ID: {frId}</small></div>
	</div>);
};

export default CardPage;
