import React from 'react';
import { assert, assMatch } from 'sjtest';
import Login from 'you-again';
import {Modal} from 'react-bootstrap';
import { XId, uid } from 'wwutils';
import Cookies from 'js-cookie';
import DataStore from '../plumbing/DataStore';
import Misc from './Misc';
import C from '../C';

/**
 * a Share This button
 */
const ShareLink = () => {
	return (<a href={window.location} onClick={ e => { e.preventDefault(); e.stopPropagation(); DataStore.setShow('ShareWidget', true); } } >
		<Misc.Icon glyph='share' /> Share
	</a>);
};

const shareThing = ({thingId, withXId}) => {
	// call the server
	Login.shareThing(thingId, withXId);
	// optimistically update the local list
	const spath = ['misc','shares', thingId];
	let shares = DataStore.getValue(spath) || [];
	shares = shares.concat({
		item: thingId,
		by: Login.getId(),
		_to: withXId 
	});
	DataStore.setValue(spath, shares);
	// clear the form
	DataStore.setValue(['widget', 'ShareWidget', 'add'], {});
};

const deleteShare = ({share}) => {
	// call the server
	const thingId = share.item;
	assMatch(thingId, String);
	Login.deleteShare(thingId, share._to);
	// optimistically update the local list
	const spath = ['misc','shares', thingId];
	let shares = DataStore.getValue(spath) || [];
	shares = shares.filter(s => s !== share);
	DataStore.setValue(spath, shares);
};

/**
 * A dialog for adding and managing shares
 * {
 * 	thingId: {!String} id for the share
 * 	name: {?String} optional name for the thing
 * }
 * 
 * Note: This does NOT include the share button -- see ShareLink for that
*/
const ShareWidget = ({thingId, name}) => {
	if ( ! thingId) {
		console.warn("ShareWidget - no thingId");
		return null;
	}
	let showDialog = DataStore.getShow('ShareWidget');
	if ( ! name) name = thingId;
	let title = "Share "+name;
	let withXId = DataStore.getValue(['widget', 'ShareWidget', 'add', 'email']);
	if (withXId) withXId += '@email';
	let sharesPV = DataStore.fetch(['misc','shares', thingId], () => {
		let req = Login.getShareList(thingId);
		return req;
	});

	const textAreaDisabled = !(DataStore.getValue(['widget', 'ShareWidget', 'form', 'enableNotification']));
	// TODO share by url on/off
	// TODO share message email for new sharers

	return (
		<Modal show={showDialog} className="share-modal" onHide={() => DataStore.setShow('ShareWidget', false)}>
			<Modal.Header closeButton>
				<Modal.Title>
					<Misc.Icon glyph='share' size='large' />
					{title}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="container-fluid">
					<div className="row form-inline">
						<Misc.PropControl label='Email to share with' 
							path={['widget', 'ShareWidget', 'add']} prop={'email'} type='email' />
						&nbsp;
						<button className='btn btn-primary' disabled={ ! withXId} 
							onClick={() => { shareThing({thingId, withXId}); }}
							title='Share it :)'
						>						
							<Misc.Icon glyph='share'/>
						</button>
					</div>
					<div className="row">
						<h3>Shared with</h3>
						<ListShares list={sharesPV.value} />
					</div>
				</div>
			</Modal.Body>
			<Modal.Footer>
				<div className="row MessageForm">
					<Misc.PropControl path={['widget', 'ShareWidget', 'form']} prop='enableNotification' label='Send notification emails' type='checkbox'/>
					<Misc.PropControl path={['widget', 'ShareWidget', 'form']} prop='OptionalMessage' id='OptionalMessage' label='Attached message' type='textarea' disabled={textAreaDisabled}/>
					<Misc.SubmitButton url='/FakeExtension' path={['widget', 'ShareWidget', 'form']}>Submit</Misc.SubmitButton>
				</div>
			</Modal.Footer>
		</Modal>
	);
}; // ./ShareWidget

const ListShares = ({list}) => {
	if ( ! list) return <Misc.Loading text='Loading current shares' />;
	console.warn('ListShares', list);
	if ( ! list.length) return <div className='ListShares'>Not shared.</div>;
	return (<div className='ListShares'>
		{list.map(s => <SharedWith key={JSON.stringify(s)} share={s} />)}
	</div>);
};

const SharedWith = ({share}) => {
	return (
		<div className='EmailListing'>
			<button title="remove this person's access"		
				onClick={ () => deleteShare({share}) }
			>
				<Misc.Icon glyph='remove'/>
			</button>
			<p>{share._to}</p>
		</div>);
};

export default ShareWidget;
export {ShareLink};

