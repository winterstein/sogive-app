import React from 'react';

import SJTest, {assert, assMatch} from 'sjtest';
import Login from 'you-again';
import { Clearfix, Grid, Row, Col, Button } from 'react-bootstrap';

import printer from '../utils/printer.js';

import DataStore from '../plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import ServerIO from '../plumbing/ServerIO';

import MonetaryAmount from '../data/charity/MonetaryAmount';
import NGO from '../data/charity/NGO';
import C from '../C';
import Roles from '../Roles';
import FundRaiser from '../data/charity/FundRaiser';
import Misc from './Misc';
import GiftAidForm from './GiftAidForm';
import NewDonationForm, {DonateButton} from './NewDonationForm';
import ListLoad from './ListLoad';
import { multipleImpactCalc } from './ImpactWidgetry';


const FundRaiserTop = () => {
	// which event?	
	let path = DataStore.getValue(['location','path']);
	let frId = path[1];
	if (frId) return <FundRaiserPage id={frId} />;
	let type = C.TYPES.FundRaiser;

	// which event?	

	return (
		<div>
			<h2>Pick a Fundraiser</h2>
			<ListLoad type={type} />
			<div><a href='#editEvent'>Create / edit events</a></div>
		</div>
	);
};


const FundRaiserPage = ({id}) => {
	const type = C.TYPES.FundRaiser;
	assMatch(type, String);
	const pFundRaiser = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.PUBLISHED});

	// fetch donations
	const pvDonations = DataStore.fetch(['list', C.TYPES.Donation, id], () => {
		return ServerIO.load('/donation/list.json', {data: {q:"fundRaiser:"+id}});
	});

	if ( ! pFundRaiser.resolved) {
		return <Misc.Loading />;
	}
	const item = pFundRaiser.value;
	if ( ! item) {
		return null; // 404 :(
	}
	let charity = FundRaiser.charity(item) || NGO.make({name:'Kiltwalk'});

	let pEvent = ActionMan.getDataItem({type: C.TYPES.Event, id: item.eventId, status: C.KStatus.PUBLISHED});
	if ( ! pEvent.resolved) {
		return <Misc.Loading />;
	}
	const event = pEvent.value;

	// Is this the owner viewing their own page? Show them a few extra items like a link to edit.
	const ownerViewing = item.owner.id === Login.getId();

	// TODO
	const supporters = [
		{
			date: '2017-11-12T10:00Z',
			amount: MonetaryAmount.make({value: 10}),
			donorName: 'Robert Florence',
			id: 'berkherkson@winterwell.com',
			img: '/img/stock-photos/male-1.jpg',
			message: `Go ${item.owner.name}!`,
		},
		{
			date: '2017-11-08T10:00Z',
			amount: MonetaryAmount.make({value: 5}),
			donorName: 'Linda Roberts',
			id: 'spoon@winterwell.com',
			img: '/img/stock-photos/female-1.jpg',
			message: `Don't slow down now - you'll break your record this year for sure!`,
		},
		{
			date: '2017-11-08T09:00Z',
			amount: MonetaryAmount.make({value: 20}),
			donorName: 'Michelle Stanley',
			id: 'joechill@winterwell.com',
			img: '/img/stock-photos/female-2.jpg',
			message: `Can't wait for the big day. Don't leave me behind, ${item.owner.name}!`,
		},
		{
			date: '2017-11-07T10:00Z',
			amount: MonetaryAmount.make({value: 30}),
			donorName: 'Colin Furze',
			id: 'fork@winterwell.com',
			img: '/img/stock-photos/male-2.jpg',
			message: `You've inspired me, you'd better donate to my fundraiser too!`,
		},
		{
			date: '2017-11-04T10:00Z',
			amount: MonetaryAmount.make({value: 5}),
			donorName: 'Helen Nelson',
			id: 't.wayne@winterwell.com',
			img: '/img/stock-photos/female-3.jpg',
			message: `Good luck!`,
		},
		{
			date: '2017-11-01T10:00Z',
			amount: MonetaryAmount.make({value: 100}),
			donorName: 'Thomas Wayne',
			id: 't.wayne@winterwell.com',
			img: '/img/stock-photos/male-3.jpg',
			message: `See you out there`,
		},
	];

	return (
		<div>
			{event? <div className='fullwidth-bg' style={{backgroundImage: `url(${event.backgroundImage})`}} /> : null}
			<div className='own-fundraiser hidden'>
				<h3>You're viewing your own fundraiser page.</h3>
				<a href={`#editFundraiser/${item.id}`}>Edit Fundraiser</a>
			</div>
			<NewDonationForm item={item} />
			<Grid id='FundRaiserPage'>
				<Row>
					<Col md={12} className='event-banner'>
						<img alt={`Banner for ${item.name}`} src={event.bannerImage} />
					</Col>
				</Row>

				<Row className='title-bar'>
					<Col md={12}>
						<h2>{item.name} {item.date? ' - ' : null} {item.date? <Misc.LongDate date={item.date} /> : null}</h2>
					</Col>
				</Row>

				<Row className='vitals'>
					<Col md={6}>
						<div className='user-event-photo'>
							<img alt={`${item.owner.name}'s photo for ${item.name}`} src={item.img} />
						</div>
					</Col>

					<Col md={6} className='donation-progress'>
						<DonationProgress item={item} supporters={supporters} charity={charity} />
					</Col>
				</Row>

				<Row>
					<Col md={6} className='me'>
						<h3>Who I am: {item.owner.name}</h3>
						<Misc.AvatarImg className='pull-left' peep={item.owner} />						
						<p>{item.owner.description}</p>
					</Col>
					<Col md={6} className='charity-info'>
						<h3>The Charity: {NGO.displayName(charity)}</h3>
						<img className='charity-logo' alt={`Logo for ${charity.name}`} src={NGO.logo(charity)} />
						<p>{NGO.shortDescription(charity)}</p>
					</Col>
				</Row>

				<Row>
					<Col md={6}>
						{item.story? 
							<div><h3>Story:</h3>{item.story}</div>
							: null}
						{item.updates? 
							<div><h3>Updates</h3>{printer.str(item.updates)}</div>
							: null}
					</Col>
					<Col md={6}>
						<h3>Supporters:</h3>
						{supporters? <DonateButton item={item} /> : null}
						<Supporters item={item} supporters={supporters} charity={/*charity*/ null} />						
					</Col>
				</Row>

				<Row>
					<Col md={12}>
						<center><DonateButton item={item} /></center>
					</Col>
				</Row>
			</Grid>			
		</div>
	);
};

const DonationProgress = ({item, supporters, charity}) => {
	FundRaiser.assIsa(item);
	const target = FundRaiser.target(item);
	const donated = FundRaiser.donated(item);
	const donatedPercent = donated && target? 100 * (donated.value / target.value) : 0;
	const remainingPercent = 100 - donatedPercent;

	// impact info
	let impacts = null;
	const project = NGO.getProject(charity);
	// NB: no project = no impact data, but you can still donate
	if (project) {
		impacts = multipleImpactCalc({ charity, project, amount: donated.value });
	}
	console.log('*** IMPACTS OF DONATIONS', impacts);

	// Don't show the impact if it has a prefix (ie formatted like "10 people donating £10 will fund 1...")
	const firstImpact = impacts && impacts[0] && !impacts[0].prefix ? (
		<div className='first-impact'>
			<big className='amount'>{impacts[0].amount}</big> {impacts[0].unitName}
		</div>
	) : null;
	const secondImpact = impacts && impacts[1] && !impacts[1].prefix ? (
		<div className='second-impact'>
			<big className='amount'>{impacts[1].amount}</big> {impacts[1].unitName}
		</div>
	) : null;

	const outputDesc = (firstImpact || secondImpact) ? (
		<div className='details-output'>
			<p>Your donations so far are enough to fund:</p>
			{firstImpact}
			{secondImpact}
		</div>
	) : null;

	return (
		<div className='donation-progress'>
			<div className='progress-graph'>
				<div className='target'>Target: <Misc.Money amount={target} /></div>
				<div className='bar-container'>
					<div className='progress-pointer value' style={{bottom: donatedPercent+'%'}}>
						<Misc.Money amount={donated} />
						<Misc.Icon glyph='triangle-right' />
					</div>
					<div className='donation-progress-bar'>
						<div className='remaining' style={{height: remainingPercent+'%'}}>&nbsp;</div>
						<div className='done' style={{height: donatedPercent+'%'}}>&nbsp;</div>
					</div>
					<div className='progress-pointer percent' style={{bottom: donatedPercent+'%'}}>
						<Misc.Icon glyph='triangle-left' />
						{Math.round(donatedPercent)}%
					</div>
				</div>
			</div>
			<div className='progress-details'>
				<DonationsSoFar item={item} supporters={supporters} />
				{outputDesc}
				<DonateButton item={item} />
			</div>
		</div>
	);
};

const DonationsSoFar = ({item, supporters}) => {
	// Access the userTarget prop directly, before calling FundRaiser.target, to see if an actual target is set
	const {donated, userTarget} = item;

	if (supporters && supporters.length) {
		const target = (userTarget && userTarget.value) ? userTarget : FundRaiser.target(item);
		const diff = MonetaryAmount.sub(target, item.donated);
		return (
			<div className='details-input'>
				<p>
					<big>{supporters.length}</big> supporters have already raised <big><Misc.Money amount={donated} /></big>.<br />
					Just <Misc.Money amount={diff} /> more to reach <Misc.Money amount={target} />!
				</p>
			</div>
		);
	}
	return (
		<div className='details-input'>
			Be the first to donate to {item.name}!
		</div>
	);
};

const Supporters = ({item, supporters = [], charity}) => {
	return (
		<ul className='supporters'>
			{supporters.map(supporter => <Supporter key={`${supporter.id}.${supporter.amount.value}.${supporter.date}`} supporter={supporter} charity={charity} />)}
			<li><Button>show more</Button></li>
		</ul>
	);
};

const Supporter = ({supporter, charity}) => {
	return (
		<li className='supporter'>
			<img className='supporter-photo' src={supporter.img} alt='supporter' />
			<h4>{supporter.donorName}</h4>
			<Misc.RelativeDate date={supporter.date} className='donation-date' />
			<div><span className='amount-donated'><Misc.Money amount={supporter.amount} /></span> donated</div>
			<p>{supporter.message}</p>
			<Clearfix />
		</li>
	);
};


export default FundRaiserTop;
