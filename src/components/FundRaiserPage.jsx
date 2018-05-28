import React from 'react';

import ReactMarkdown from 'react-markdown';

import SJTest, {assert, assMatch} from 'sjtest';
import Login from 'you-again';
import { Clearfix, Grid, Row, Col, Button } from 'react-bootstrap';

import printer from '../base/utils/printer.js';
import _ from 'lodash';
import {encURI} from 'wwutils';
import DataStore from '../base/plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import ServerIO from '../plumbing/ServerIO';
import {notifyUser} from '../base/plumbing/Messaging';
import Money from '../base/data/Money';
import NGO from '../data/charity/NGO';
import Output from '../data/charity/Output';
import C from '../C';
import Roles from '../base/Roles';
import FundRaiser from '../data/charity/FundRaiser';
import Donation from '../data/charity/Donation';
import Misc from '../base/components/Misc';
import GiftAidForm from './GiftAidForm';
import NewDonationForm, {DonateButton} from './NewDonationForm';
import ListLoad from '../base/components/ListLoad';
import {ImpactDesc} from './ImpactWidgetry';
import SocialShare from './SocialShare';
import {canWrite} from '../base/components/ShareWidget';

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
			<hr/>
			<div>
				Fundraisers are personal pages linked to a specific event, e.g. 
				"Sanjay's Sponsored Marathon". 
				To create a Fundraiser, start by registering for the <a href='#event'>event</a>.
			</div>
		</div>
	);
};

const isOwner = item => item.owner.id === Login.getId();

const FundRaiserPage = ({id}) => {
	const type = C.TYPES.FundRaiser;
	assMatch(type, String);
	const pFundRaiser = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.PUBLISHED});

	// fetch donations for this fundraiser
	const pvDonations = DataStore.fetch(['list', C.TYPES.Donation, id], () => {
		// minor TODO use ServerIO.getDonations		
		return ServerIO.load('/donation/list.json', {data: {q:"fundRaiser:"+id, sort:"date-desc", status: C.KStatus.PUBLISHED}});
	});
	const donations = pvDonations.value && pvDonations.value.hits;

	if ( ! pFundRaiser.resolved) {
		return <Misc.Loading />;
	}
	const item = pFundRaiser.value;
	if ( ! item) {
		return null; // 404 :(
	}
	let charity = FundRaiser.charity(item);
	if ( ! charity) {
		charity = NGO.make(); 
		console.warn("FundRaiser with no charity set?!");
	}

	let pEvent = ActionMan.getDataItem({type: C.TYPES.Event, id: item.eventId, status: C.KStatus.PUBLISHED});
	if ( ! pEvent.resolved) {
		return <Misc.Loading />;
	}
	const event = pEvent.value;

	// Is this the owner viewing their own page? Show them a few extra items like a link to edit.
	const ownerViewing = isOwner(item);
	const cw = canWrite(type, item.id).value;
	if (ownerViewing) {
		_.defer(notifyUser, {
			type:'info',
			id: 'welcome-you',
			text:'Welcome to your fundraiser page',
			jsx: <a href={'#editFundraiser/'+item.id}>Edit Fundraiser</a>,
			onePageOnly: true
		});
	} else if (cw) {
		_.defer(notifyUser, {
			type:'info',
			id: 'welcome-editor',
			text: 'You can edit this fundraiser page',
			jsx: <a href={'#editFundraiser/'+escape(item.id)}>Edit Fundraiser</a>,
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

					<Col md={6}>
						<DonationProgress item={item} charity={charity} />
					</Col>
				</Row>

				<Row>
					<Col md={6} className='me'>
						<center>
							<h3>About Me: {item.owner.name}</h3>
						</center>
						<Misc.AvatarImg className='pull-left' peep={item.owner} />						
						<p>{item.owner.description? <ReactMarkdown source={item.owner.description} /> : null}</p>
						<p><small><a href={event.url || '#event/'+encURI(event.id)} target={event.url? '_blank': ''}>About the event</a></small></p>
					</Col>
					<Col md={6} className='charity-info'>
						<center>
							<h3>The Charity: {NGO.displayName(charity)}</h3>							
						</center>
						<img className='charity-logo' alt={`Logo for ${charity.name}`} src={NGO.logo(charity)} />
						<p>
							{NGO.shortDescription(charity)} &nbsp;
							<small><a href={charity.url || '#charity?charityId='+encURI(NGO.id(charity))} target={charity.url? '_blank': ''}>More info</a></small>
						</p>					
					</Col>
				</Row>

				<Row>
					<Col md={6}>
						{item.story? 
							<div><h3>Story:</h3><ReactMarkdown source={item.story} /></div>
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
						<SocialShare charity={charity} fundraiser={item} />
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
		return (<div className='DonationProgress no-money'>
			<p>No money raised yet.</p>
			{isOwner(item)? <p>Why not kick-start things by making a seed donation yourself?</p> : null}
			<div className='target'>Target: <Misc.Money amount={target} /></div>
			<DonateButton item={item} />
		</div>);
	}

	const donatedPercent = donated && target? 100 * (donated.value / target.value) : 0;
	// Clamp the bar height to 100% for obvious reasons
	const donatedBarHeight =Math.min(100, donatedPercent);
	const remainingBarHeight = 100 - donatedBarHeight;

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
				{charity && charity.hideImpact? null 
					: <ImpactDesc charity={charity} amount={donated} showMoney={false} beforeText='Your donations so far are enough to fund' maxImpacts={2} />}
				<DonateButton item={item} />				
			</div>
		</div>
	);
}; // DonationProgress

const DonationsSoFar = ({item}) => {
	// Access the userTarget prop directly, before calling FundRaiser.target, to see if an actual target is set
	const {userTarget, donationCount } = item;
	const donated = FundRaiser.donated(item);
	
	if ( ! donationCount && Money.value(donated) === 0) {
		return (
			<div className='details-input'>
				Be the first to donate to {item.name}!
			</div>
		);		
	}
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
};

const Supporters = ({item, donations = [], charity}) => {
	return (
		<ul className='supporters'>
			{donations.map(donation => <Supporter key={`${donation.id}.${donation.amount.value}.${donation.date}`} donation={donation} charity={charity} />)}			
		</ul>
	);
	// TODO <li className='show-more'><Button>show more</Button></li>
};

const Supporter = ({donation, charity}) => {
	let name = Donation.donorName(donation) || 'Anonymous Donor';
	if (donation.anonymous) {
		name = 'Anonymous Donor';
	}
	const personImg = donation.donor && donation.donor.img;

	return (
		<li className='donation'>
			{ personImg && ! donation.anonymous? (
				<img className='supporter-photo' src={personImg} alt={`${name}'s avatar`} />
			) : null }
			<h4>{name}</h4>
			<Misc.RelativeDate date={donation.date} className='donation-date' />			
			{donation.anonAmount? null : <div><span className='amount-donated'><Misc.Money amount={Donation.amount(donation)} /></span> donated</div>}
			{donation.contributions && ! donation.anonAmount? 
				donation.contributions.map((con, ci) => <div key={ci} className='contribution'><Misc.Money amount={con.money} /> {con.text}</div>)
				: null}
			{ donation.message ? (
				<p>{donation.message}</p>
			) : null }
			<Clearfix />
		</li>
	);
};


export default FundRaiserTop;
