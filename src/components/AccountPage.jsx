import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../utils/printer.js';
import C from '../C';
import Roles from '../Roles';
import Misc from './Misc';
import GiftAidForm from './GiftAidForm';

const AccountPage = () => {
	let proles =Roles.getRoles();
	return (
		<div className=''>
			<h2>My Account</h2>
			<Misc.Card title='Login'>
				ID: {Login.getId()}
			</Misc.Card>
			<Misc.Card title='Gift Aid'>
				<GiftAidForm />
			</Misc.Card>
			<Misc.Card title='Roles'>
				<p>Roles determine what you can do. E.g. only editors can publish changes.</p>
				{proles.value? proles.value.map(role => <RoleLine key={role} role={role} />) : <Misc.Loading />}
			</Misc.Card>
		</div>
	);
};

const RoleLine = ({role}) => {
	return <div className='well'>{role}</div>;
};

export default AccountPage;
