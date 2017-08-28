import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import printer from '../utils/printer.js';
import C from '../C';
import Roles from '../Roles';
import Misc from './Misc';

const AccountPage = () => {
	let proles =Roles.getRoles();
	return (
		<div className=''>
			<h2>My Account</h2>
			<Misc.Card title='Roles'>
				<p>Roles determine what you can do. E.g. only editors can publish changes.</p>
				{proles.value? proles.value.map(role => <RoleLine key={role} role={role} />) : <Misc.Loading />}
			</Misc.Card>
			<h3>In development...</h3>
			<p>Thank you for joining SoGive at this early stage.
				This is our first release, and there's still lots of work to do.
				By the way, we release all our code as open-source. If you would
				like to contribute to building SoGive, please get in touch.
			</p>
		</div>
	);
};

const RoleLine = ({role}) => {
	return <div className='well'>{role}</div>;
};

export default AccountPage;
