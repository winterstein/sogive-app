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
	let type = C.TYPES.FundRaiser;
	assMatch(type, String);
	let pEvent = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.PUBLISHED});

	// fetch donations
	let pvDonations = DataStore.fetch(['list', C.TYPES.Donation, id], () => {
		return ServerIO.load('/donation/list.json', {data: {q:"fundRaiser:"+id}});
	});
	// console.warn(pEvent);
	if ( ! pEvent.resolved) {
		return <Misc.Loading />;
	}
	let item = pEvent.value;
	if ( ! item) {
		return null; // 404 :(
	}
	let charity = FundRaiser.charity(item) || NGO.make({name:'Kiltwalk'});

	// TODO
	const supporters = [
		{
			date: '2017-11-01T10:00Z',
			amount: MonetaryAmount.make({value: 10}),
			donorName: 'Berk Herkson',
			id: 'berkherkson@winterwell.com',
			img: 'http://bogleech.com/trapdoor/td-berk.jpg',
			message: 'I\'m Berk!',
		},
		{
			date: '2017-11-03T10:00Z',
			amount: MonetaryAmount.make({value: 5}),
			donorName: 'Spoon McGuffin',
			id: 'spoon@winterwell.com',
			img: 'http://www.geminieventrentals.com/wp-content/uploads/2015/01/King-Spoon-500x500.jpg',
			message: 'Thank you, Sir Patrick. You have made the world a better place for spoons and witches.',
		},
		{
			date: '2017-11-10T10:00Z',
			amount: MonetaryAmount.make({value: 20}),
			donorName: 'Joe Chill',
			id: 'joechill@winterwell.com',
			img: 'https://static.comicvine.com/uploads/original/11127/111278246/5090739-2402727027-latest',
			message: 'I KILLED BATMAN\'S PARENTS. THAT\'S MY WHOLE DEAL.',
		},
		{
			date: '2017-11-20T10:00Z',
			amount: MonetaryAmount.make({value: 30}),
			donorName: 'Fork McGuffin',
			id: 'fork@winterwell.com',
			img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Tranchergaffel%2C_1640-tal_-_Skoklosters_slott_-_102831.tif/lossy-page1-220px-Tranchergaffel%2C_1640-tal_-_Skoklosters_slott_-_102831.tif.jpg',
			message: 'What Spoon said, but more... furcated.',
		},
		{
			date: '2017-11-29T10:00Z',
			amount: MonetaryAmount.make({value: 5}),
			donorName: 'Thomas Wayne',
			id: 't.wayne@winterwell.com',
			img: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/Thomas_Wayne.png/250px-Thomas_Wayne.png',
			message: 'I love you, my billionaire ninja son. Always remember who you are.',
		},
	];

	return (
		<div>
			<div id='fundraiser-bg' />
			<NewDonationForm item={item} />
			<Grid id='FundRaiserPage'>
				<Row>
					<Col md={12} className='event-banner'>
						<img alt={`Banner for ${item.name}`} src={item.banner} />
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
						<DonationProgress item={item} />
					</Col>
				</Row>

				<Row>
					<Col md={6} className='me'>
						<h3>Who I am: {item.owner.name}</h3>
						<Misc.AvatarImg peep={item.owner} />						
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

const DonationProgress = ({item}) => {
	FundRaiser.assIsa(item);
	const target = FundRaiser.target(item);
	const donated = FundRaiser.donated(item);
	const donatedPercent = donated && target? 100 * (donated.value / target.value) : 0;
	const remainingPercent = 100 - donatedPercent;

	return (
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

			<div className='progress-details'>
				<div className='details-input'>
					<Misc.Money amount={donated} />
					raised of <Misc.Money amount={target} /> by {item.supporters && item.supporters.length} supporters
				</div>
				<div className='details-output'>
					<div className='first-impact'>
						<span className='amount'>99 people</span> turned into frogs by witches
					</div>
					<div className='second-impact'>
						<span className='amount'>25</span> local ponds repopulated with friendly amphibians
					</div>
				</div>
				<DonateButton item={item} />
			</div>
		</div>);
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
