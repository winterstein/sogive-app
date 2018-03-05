import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../utils/printer.js';
import C from '../C';
import DataStore from '../plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import Roles from '../Roles';
import Misc from './Misc';
import GiftAidForm from './GiftAidForm';
import {XId} from 'wwutils';
import Transfer from '../data/Transfer';
import {LoginLink} from './LoginWidget/LoginWidget';

const AccountPage = () => {
	if ( ! Login.isLoggedIn()) {
		return <div><h2>My Account: Please login</h2><LoginLink title='Login' /></div>;
	}
	let proles =Roles.getRoles();
	let roles = proles.value;
	const pvCreditToMe = DataStore.fetch(['list', 'Transfer', 'to:'+Login.getId()], () => {	
		return ServerIO.load('/credit/list', {data: {to: Login.getId()} });
	});	
	// TODO link into My-Loop, and vice-versa
	// TODO store gift aid settings
			// 	<Misc.Card title='Gift Aid'>
			// 	<GiftAidForm />
			// </Misc.Card>
	return (
		<div className=''>
			<h2>My Account</h2>
			<Misc.Card title='Login'>
				ID: {Login.getId()} <br />
				My donations: shown on the <a href='#dashboard'>Dashboard</a>
			</Misc.Card>			
			<Misc.Card title='Roles'>
				<p>Roles determine what you can do. E.g. only editors can publish changes.</p>
				{proles.resolved? <p>No role</p> : <Misc.Loading />}
				{roles? roles.map((role, i) => <RoleLine key={i+role} role={role} />) : null}				
			</Misc.Card>
			{pvCreditToMe.value && pvCreditToMe.value.hits? <CreditToMe credits={pvCreditToMe.value.hits} /> : null}
			{Roles.iCan(C.CAN.uploadCredit).value ? <UploadCredit /> : null}
		</div>
	);
};

const CreditToMe = ({credits}) => {
	let totalCred = Transfer.getCredit();
	return (<Misc.Card title='Credit'>
		{credits.map(cred => <div key={cred.id}><Misc.Money amount={cred.amount} /> from {XId.prettyName(cred.from)}</div>)}
		<div>
			Total: <Misc.Money amount={totalCred} />
		</div>
	</Misc.Card>);
};

const UploadCredit = () => {
	const pvCredits = DataStore.fetch(['list', 'Transfer', 'from:'+Login.getId()], () => {	
		return ServerIO.load('/credit/list', {data: {from: Login.getId()} });
	});
	let path = ['widget', 'UploadCredit' ,'form'];
	return (<Misc.Card title='Upload Credit'>
		{pvCredits.value? pvCredits.value.hits.map(transfer => <div key={transfer.id}><Misc.Money amount={transfer.amount} /> to {transfer.to}</div>) : null}
		<p>HACK: please paste 2-column csv text below, with the headers <code>Email, Credit</code></p>
		<Misc.PropControl path={path} prop='csv' label='CSV' type='textarea' />
		<Misc.SubmitButton url='/credit' path={path} once>Submit</Misc.SubmitButton>
	</Misc.Card>);
};

const RoleLine = ({role}) => {
	return <div className='well'>{role}</div>;
};

export default AccountPage;
