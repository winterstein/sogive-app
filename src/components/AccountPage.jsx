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
	let roles = proles.value;
	// TODO link into My-Loop, and vice-versa
	// TODO store gift aid settings
			// 	<Misc.Card title='Gift Aid'>
			// 	<GiftAidForm />
			// </Misc.Card>
	return (
		<div className=''>
			<h2>My Account</h2>
			<Misc.Card title='Login'>
				ID: {Login.getId()}
			</Misc.Card>
			<Misc.Card title='Roles'>
				<p>Roles determine what you can do. E.g. only editors can publish changes.</p>
				{proles.resolved? <p>No role</p> : <Misc.Loading />}
				{roles? roles.map(role => <RoleLine key={role} role={role} />) : null}				
			</Misc.Card>
		</div>
	);
};

const RoleLine = ({role}) => {
	return <div className='well'>{role}</div>;
};

export default AccountPage;
