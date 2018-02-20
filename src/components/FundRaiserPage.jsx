import React from 'react';

import SJTest, {assert, assMatch} from 'sjtest';
import Login from 'you-again';
import { Clearfix, Grid, Row, Col, Button } from 'react-bootstrap';

import printer from '../utils/printer.js';
import _ from 'lodash';
import DataStore from '../plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import ServerIO from '../plumbing/ServerIO';
import {notifyUser} from '../plumbing/Messaging';
import Money from '../data/charity/Money';
import NGO from '../data/charity/NGO';
import Output from '../data/charity/Output';
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
		return ServerIO.load('/donation/list.json', {data: {q:"fundRaiser:"+id, status: C.KStatus.PUBLISHED}});
	});
	const donations = pvDonations.value && pvDonations.value.hits;

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
	if (ownerViewing) {
		_.defer(notifyUser, {
			type:'info',
			id: 'welcome-you',
			text:'Welcome to your fundraiser page',
			jsx: <a href={'#editFundraiser/'+item.id}>Edit Fundraiser</a>,
			onePageOnly: true
		});
	}

	return (
		<div>
			{event ? <div className='fullwidth-bg' style={{backgroundImage: `url(${event.backgroundImage})`}} /> : null}
			<NewDonationForm item={item} />
			<Grid id='FundRaiserPage'>
				{event.bannerImage? <Row>
					<Col md={12} className='event-banner'>
						<img alt={`Banner for ${item.name}`} src={event.bannerImage} />
					</Col>
				</Row> : null}

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
						<DonationProgress item={item} charity={charity} />
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
						{/*supporters? <DonateButton item={item} /> : null*/}
						{ donations ? (
							<Supporters item={item} donations={donations} charity={/*charity*/ null} />						
						) : null}
						
					</Col>
				</Row>
				{/*
				<Row>
					<Col md={12}>
						<center><DonateButton item={item} /></center>
					</Col>
				</Row>
				*/}
			</Grid>
		</div>
	);
};

const DonationProgress = ({item, charity}) => {
	FundRaiser.assIsa(item);
	const target = FundRaiser.target(item);
	assMatch(target, "?Money");
	const donated = FundRaiser.donated(item);
	assMatch(donated, "?Money");
	// nothing?
	if (Money.value(donated) < 0.1) {
		return (<div className='DonationProgress'>
			<p>No money raised yet</p>
			<div className='target'>Target: <Misc.Money amount={target} /></div>
			<DonateButton item={item} />
		</div>);
	}

	const donatedPercent = donated && target? 100 * (donated.value / target.value) : 0;
	// Clamp the bar height to 100% for obvious reasons
	const donatedBarHeight =Math.min(100, donatedPercent);
	const remainingBarHeight = 100 - donatedBarHeight;

	// impact info
	// TODO refactor with ImpactWidgetry.jsx
	let impacts = null;
	const project = NGO.getProject(charity);
	// NB: no project = no impact data, but you can still donate
	if (project) {
		impacts = multipleImpactCalc({ charity, project, cost: donated });
	}
	console.log('*** IMPACTS OF DONATIONS', impacts);

	const firstImpact = impacts && impacts[0]? (
		<div className='first-impact'>
			<big className='amount'>{Output.number(impacts[0])}</big> {Output.name(impacts[0])}
		</div>
	) : null;
	const secondImpact = impacts && impacts[1]? (
		<div className='second-impact'>
			<big className='amount'>{Output.number(impacts[1])}</big> {Output.name(impacts[1])}
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
		<div className='DonationProgress'>
			<div className='ProgressGraph'>
				<div className='target'>Target: <Misc.Money amount={target} /></div>
				<div className='bar-container'>
					<div className='progress-pointer value' style={{bottom: donatedBarHeight+'%'}}>
						<Misc.Money amount={donated} />
						<Misc.Icon glyph='triangle-right' />
					</div>
					<div className='donation-progress-bar'>
						<div className='remaining' style={{height: remainingBarHeight+'%'}}>&nbsp;</div>
						<div className='done' style={{height: donatedBarHeight+'%'}}>&nbsp;</div>
					</div>
					<div className='progress-pointer percent' style={{bottom: donatedBarHeight+'%'}}>
						<Misc.Icon glyph='triangle-left' />
						{Math.round(donatedPercent)}%
					</div>
				</div>
			</div>
			<div className='progress-details'>
				<DonationsSoFar item={item} />
				{outputDesc}
				<DonateButton item={item} />
			</div>
		</div>
	);
}; // DonationProgress

const DonationsSoFar = ({item}) => {
	// Access the userTarget prop directly, before calling FundRaiser.target, to see if an actual target is set
	const {donated, userTarget, donationCount } = item;

	if (donationCount > 0) {
		const target = (userTarget && userTarget.value) ? userTarget : FundRaiser.target(item);
		const diff = Money.sub(target, item.donated);

		if (diff.value <= 0) {
			return (
				<div className='details-input'>
					<p>
						<big>{donationCount}</big> supporters have already raised <big><Misc.Money amount={donated} /></big>.<br />
						We've passed <Misc.Money amount={target} /> in donations - what's next?
					</p>
				</div>
			);
		}

		return (
			<div className='details-input'>
				<p>
					<big>{donationCount}</big> supporters have already raised <big><Misc.Money amount={donated} /></big>.<br />
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

const Supporters = ({item, donations = [], charity}) => {
	return (
		<ul className='supporters'>
			{donations.map(donation => <Donation key={`${donation.id}.${donation.amount.value}.${donation.date}`} donation={donation} charity={charity} />)}
			<li className='show-more'><Button>show more</Button></li>
		</ul>
	);
};

const Donation = ({donation, charity}) => {
	const name = (donation.person && donation.person.name) || donation.donorName || 'Anonymous Donor';
	const personImg = donation.person && donation.person.img;

	return (
		<li className='donation'>
			{ personImg ? (
				<img className='supporter-photo' src={personImg} alt={`${name}'s avatar`} />
			) : null }
			<h4>{name}</h4>
			<Misc.RelativeDate date={donation.date} className='donation-date' />
			<div><span className='amount-donated'><Misc.Money amount={donation.amount} /></span> donated</div>
			{ donation.message ? (
				<p>{donation.message}</p>
			) : null }
			<Clearfix />
		</li>
	);
};


export default FundRaiserTop;
