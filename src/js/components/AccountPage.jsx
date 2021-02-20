import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from '../base/youagain';
import printer from '../base/utils/printer.js';
import C from '../C';
import DataStore from '../base/plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import Roles from '../base/Roles';
import Misc from '../base/components/Misc';
import GiftAidForm from './GiftAidForm';
import Transfer from '../base/data/Transfer';
import {LoginLink} from '../base/components/LoginWidget';
import {RolesCard, LoginCard} from '../base/components/AccountPageWidgets';
import ListLoad from '../base/components/ListLoad';
import XId from '../base/data/XId';
import {RDItem} from './editor/ManageRepeatDonationsPage';

const AccountPage = () => {
	if ( ! Login.isLoggedIn()) {
		return <div><h2>My Account: Please login</h2><LoginLink title='Login' /></div>;
	}
	const pvCreditToMe = DataStore.fetch(['list', 'Transfer', 'to:'+Login.getId()], () => {
		return ServerIO.load('/credit/_list', {data: {to: Login.getId()} });
	});
	// TODO link into My-Loop, and vice-versa
	// TODO store gift aid settings
			// 	<Card title='Gift Aid'>
			// 	<GiftAidForm />
			// </Card>
	return (
		<div className=''>
			<h2>My Account</h2>
			<LoginCard />
			<Misc.Card title='My donations'>Your donations are shown on the <a href='#dashboard'>Dashboard</a></Misc.Card>
			<RolesCard />
			<Misc.Card title='Repeating Donations'><RepeatingDonations /></Misc.Card>
			{pvCreditToMe.value && pvCreditToMe.value.hits? <CreditToMe credits={pvCreditToMe.value.hits} /> : null}
			{Roles.iCan(C.CAN.uploadCredit).value ? <UploadCredit /> : null}
		</div>
	);
};

// TODO
// const RDListItem = ({item}) => {

// };

const RepeatingDonations = () => {
	// ListItem={RDListItem}
	return <ListLoad type={C.TYPES.RepeatDonation} servlet='repeatdonation'
		q='from:me' checkboxes={false} status={C.KStatus.ALL_BAR_TRASH} ListItem={RDItem}
		canDelete />;
	// const pvRDons = DataStore.fetch(['list', C.TYPES.RepeatDonation, 'from:me'], () => {
	// 	return ServerIO.load('/repeatDonation/_list', {data: {q: "from:me"} });
	// });
	// if ( ! pvRDons.resolved) return <Misc.Loading />;
	// return (<div>{JSON.stringify(pvRDons.value)}</div>);
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
		return ServerIO.load('/credit/_list', {data: {from: Login.getId()} });
	});
	let path = ['widget', 'UploadCredit' ,'form'];
	return (<Misc.Card title='Upload Credit'>
		{pvCredits.value? pvCredits.value.hits.map(transfer => <div key={transfer.id}><Misc.Money amount={transfer.amount} /> to {transfer.to}</div>) : null}
		<p>HACK: please paste 2-column csv text below, with the headers <code>Email, Credit</code></p>
		<Misc.PropControl path={path} prop='csv' label='CSV' type='textarea' />
		<Misc.SubmitButton url='/credit' path={path} once>Submit</Misc.SubmitButton>
	</Misc.Card>);
};

export default AccountPage;
