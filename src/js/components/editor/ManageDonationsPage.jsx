import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert, assMatch} from 'sjtest';
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

const COLUMNS = [
	{
		id: 'id',
		Header: 'Id',
		accessor: d => getId(d)
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
		Header: 'Donor',
		accessor: 'donorName'
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
	{
		Header: "Tip",
		accessor: row => row.hasTip && row.tip, // check it was included
		Cell: v => <Misc.Money amount={v} />
	},
	{
		Header: "Contributions",
		accessor: 'contributions',
		Cell: cons => cons? cons.map((con,i) => <div key={i} className='contribution'><Misc.Money amount={con.money} /> {con.text}</div>) : null
	},
	'via',
	{
		Header: "Fund-Raiser",
		accessor: 'fundRaiser',
		Cell: fr => fr? <a href={'/#fundraiser/'+escape(fr)}>{fr}</a> : null
	},
	'app',
	{
		Header: 'on-credit',
		accessor: d => d.stripe && d.stripe.type === 'credit'
	},
	{
		Header: "Paid Out",
		accessor: 'paidOut',
		editable: true,
		type: 'checkbox',
		saveFn: ({path,...huh}) => {
			Misc.publishDraftFn({path});
		}
	},
	{
		Header: "Gift Aid",
		accessor: 'giftAid'
	},
	{
		Header: 'Consent to share PII',
		accessor: 'consentToSharePII'
	},
	{
		Header: "Donor details",
		accessor: d => (d.donorAddress||'') + " " + (d.donorPostcode||'')
	},
	'status'
];	// ./ COLUMNS


const housen = don => {
	if ( ! don.donorAddress) return "";
	let addr = don.donorAddress;
	// TODO "2f2, 123 Hill Road" -> "2f2, 123"??
	// TODO "Flat 7b, 123 Hill Road" -> "Flat 7b, 123"??
	// first number or first comma
	let hn = addr.trim().replace(/(.*)?(\\d+\\w*\\b|,).*/, "$1$2");
	if (hn[hn.length -1] === ',') hn = hn.substr(0, hn.length-1);
	return hn;
};

const ManageDonationsPage = () => {

	if ( ! Login.isLoggedIn()) {
		return <div>Please login</div>;
	}
	if ( ! Roles.iCan(C.CAN.manageDonations).value) {
		return <div>You need the `manageDonations` capability.</div>;
	}

	const pvDonations = ActionMan.list({
		type: C.TYPES.Donation, status: C.KStatus.ALL_BAR_TRASH,
		q:'ALL purpose:admin'
	});

	if ( ! pvDonations.resolved) {
		return <Misc.Loading />;
	}
	let rdons = pvDonations.value;
	console.warn('rdons', rdons);
	let dons = rdons.hits;

	// ?? SHould this be made into a utility method in DataStore?? getDataList??
	// resolve from list version to latest (so edits can be seen)
	dons = dons.map(
		// prefer draft, so you can see edits in progress
		don => DataStore.getData({status:C.KStatus.DRAFT, type:getType(don), id:getId(don)})
				|| DataStore.getData({status:getStatus(don), type:getType(don), id:getId(don)})
				|| don
	);

	// normal format
	let columns = COLUMNS;

	// Gift Aid format?
	const isGiftAidFormat = DataStore.getUrlValue("format")==='hmrc';
	if (isGiftAidFormat) {
		columns = [
			'Title',
			{
				Header: 'First name',
				accessor: don => don.donorName? don.donorName.trim().replace(/\s.*/,"") : ""
			},
			{
				Header: 'Last name',
				accessor: don => don.donorName? don.donorName.trim().replace(/^\S+\s/,"") : ""
			},
			{
				Header: 'House name or number',	// or address if foreign
				accessor: housen
			},
			{
				Header: 'Postcode',
				accessor: 'donorPostcode'
			},
			// 'donorAddress',
			{
				Header: 'Aggregated donations'
			},
			{
				Header: 'Sponsored event',
				accessor: don => don.fundRaiser? "Yes" : ""
			},
			{	// DD/MM/YY
				Header: 'Donation date',
				type: 'date',
				accessor: don => don.date? new Date(don.date).toLocaleDateString("en-GB") : ""
			},
			columns.find(c => c.Header==='Amount'),
			// columns.find(c => c.accessor==='giftAid'),
		];
		dons = dons.filter(don => don.giftAid);
	}

	return (
		<div className=''>
			<h2>Manage Donations</h2>
			<PropControl label='Format' prop='format' options={['normal', 'hmrc']}
				labels={['Normal', 'HMRC Gift Aid Format']} type='select' />
			{isGiftAidFormat? <p>The table below is filtered to ONLY include donations with gift-aid.</p> : null}
			<SimpleTable data={dons} columns={columns} hasCsv hasFilter
				addTotalRow={ ! isGiftAidFormat} hideEmpty={ ! isGiftAidFormat}
				rowsPerPage={100}
			/>
		</div>
	);
};

export default ManageDonationsPage;
