import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert, assMatch} from 'sjtest';
import Login from 'you-again';
import {encURI} from 'wwutils';

import ActionMan from '../../plumbing/ActionMan';
import DataStore from '../../plumbing/DataStore';
import ServerIO from '../../plumbing/ServerIO';
import C from '../../C';
import Roles from '../../Roles';
import {getId} from '../../data/DataClass';
import Misc from '../Misc';

const ManageDonationsPage = () => {
	const pvDonations = DataStore.fetch(['list', 'Donations', 'all'], () => {
		return ServerIO.load('/donation/list.json', {data: {}});
	});
	if ( ! pvDonations.resolved) {
		return <Misc.Loading />;
	}
	let rdons = pvDonations.value;
	console.warn('rdons', rdons);
	let dons = rdons.hits;
	// TODO ListLoad ??
	return (
		<div className=''>
			<h2>TODO Manage Donations</h2>
			<table className='table'>
				<tbody>
					<tr>
						<th>ID</th>
						<th>From</th>
						<th>To</th>						
						<th>Paid out to charity?</th>						
						<th>json</th>
					</tr>
					{dons.map(don => <DonRow key={getId(don)} don={don} />)}
				</tbody>
			</table>
		</div>
	);
};

const DonRow = ({don}) => {
	return (<tr>
		<td>{getId(don)}</td>
		<td>{don.from}</td>
		<td>{don.to}</td>
		<td>{don.paidOut}</td>
		<td>json {JSON.stringify(don)}</td>
	</tr>);
};

export default ManageDonationsPage;
