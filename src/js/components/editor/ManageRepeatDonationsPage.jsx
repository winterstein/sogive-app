import React from 'react';
import ReactDOM from 'react-dom';

import Login from '../../base/youagain';

import ActionMan from '../../plumbing/ActionMan';
import DataStore from '../../base/plumbing/DataStore';
import ServerIO from '../../plumbing/ServerIO';
import C from '../../C';
import Roles from '../../base/Roles';
import {getId,getType,getStatus} from '../../base/data/DataClass';
import Money from '../../base/data/Money';
import MoneyItem from '../../base/data/MoneyItem';
import Misc from '../../base/components/Misc';
import SimpleTable from '../../base/components/SimpleTable';
import PropControl from '../../base/components/PropControl';
import XId from '../../base/data/XId';
import ListLoad from '../../base/components/ListLoad';
import KStatus from '../../base/data/KStatus';
import { copyTextToClipboard, stopEvent } from '../../base/utils/miscutils';

const COLUMNS = [
	{
		id: 'id',
		Header: 'Id',
		accessor: d => getId(d)
	},
	{
		id: 'did',
		Header: 'did',
		accessor: "did"
	},
	{
		Header: 'Date',
		accessor: 'date'
	},
	{
		Header: 'From',
		accessor: 'from',
		Cell: v => XId.dewart(v)
	},
	{
		Header: 'To',
		accessor: 'to'
	},
	{
		Header: "Amount",
		accessor: 'amount',
		Cell: v => <Misc.Money amount={v} />, // Custom cell components!
		sortAccessor: a => Money.value(a.amount)
	},
	"ical",
	"done",	
	{
		Header: "Fund-Raiser",
		accessor: 'fundRaiser',
		Cell: fr => fr? <a href={'/#fundraiser/'+escape(fr)}>{fr}</a> : null
	},
	'status',

];	// ./ COLUMNS

const ManageRepeatDonationsPage = () => {

	if ( ! Login.isLoggedIn()) {
		return <div>Please login</div>;
	}
	if ( ! Roles.iCan(C.CAN.manageDonations).value) {
		return <div>You need the `manageDonations` capability.</div>;
	}

	// const pvDonations = ActionMan.list({
	// 	type: C.TYPES.Donation, status: C.KStatus.ALL_BAR_TRASH,
	// 	q:'ALL purpose:admin'
	// });

	// if ( ! pvDonations.resolved) {
	// 	return <Misc.Loading />;
	// }
	// let rdons = pvDonations.value;
	// console.warn('rdons', rdons);
	// let dons = rdons.hits;

	// // ?? SHould this be made into a utility method in DataStore?? getDataList??
	// // resolve from list version to latest (so edits can be seen)
	// dons = dons.map(
	// 	// prefer draft, so you can see edits in progress
	// 	don => DataStore.getData({status:C.KStatus.DRAFT, type:getType(don), id:getId(don)})
	// 			|| DataStore.getData({status:getStatus(don), type:getType(don), id:getId(don)})
	// 			|| don
	// );

	// // normal format
	// let columns = COLUMNS;

	return (
		<div className=''>
			<h2>Manage Repeat Donations</h2>
			<ListLoad filterLocally cannotClick canFilter canDelete status={KStatus.ALL_BAR_TRASH} type={C.TYPES.RepeatDonation} ListItem={RDItem} />
			{/* <SimpleTable data={dons} columns={columns} csv hasFilter
				rowsPerPage={100}
			/> */}
		</div>
	);
};

export const RDItem = ({type, servlet, navpage, item, sort}) => {
	return <div onClick={e => console.log(e) && stopEvent(e) && copyTextToClipboard(JSON.stringify(item))}>
	ID: {item.id}, 
	Donation ID: {item.did}, 
	Date created: <Misc.DateTag date={item.date || item.created} />, 
	From: {XId.dewart(item.from)}, 
	To: {item.to}, 
	Amount: {item.amount && <Misc.Money amount={item.amount} />}, 
	ical: {item.ical && item.ical.repeat && item.ical.repeat.freq+" until: "+item.ical.repeat.until}, 
	done: {item.done}, 
	{item.fundRaiser && <>Fundraiser: <a href={'/#fundraiser/'+escape(item.fundRaiser)}>{item.fundRaiser}</a>, </>}
	Status: {getStatus(item)}, 
	</div>
};

export default ManageRepeatDonationsPage;
