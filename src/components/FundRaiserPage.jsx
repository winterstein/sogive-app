import React from 'react';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import { Grid, Row, Col, Glyphicon } from 'react-bootstrap';

import printer from '../utils/printer.js';

import DataStore from '../plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';

import MonetaryAmount from '../data/charity/MonetaryAmount';
import C from '../C';
import Roles from '../Roles';

import Misc from './Misc';
import GiftAidForm from './GiftAidForm';
import NewDonationForm from './NewDonationForm';
import ListLoad from './ListLoad';


const FundRaiserPage = () => {
	// which event?	
	let path = DataStore.getValue(['location','path']);
	let frId = path[1];
	if (frId) return <FundRaiser id={frId} />;
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


const FundRaiser = ({id}) => {
	let type = C.TYPES.FundRaiser;
	let pEvent = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.DRAFT});

	if ( ! pEvent.value) {
		return <Misc.Loading />;
	}
	let item = pEvent.value;

	item.name = item.name || 'PlaceholderWalk';
	item.date = item.date || '2018-02-14';
	item.target = item.target || MonetaryAmount.make({value: 1000});
	item.donated = item.donated || MonetaryAmount.make({value: 768});
	const donatedProportion = item.donated.value / item.target.value;

	item.owner = {
		name: 'Patrick',
		photo: 'https://www.famousbirthdays.com/headshots/patrick-stewart-5.jpg',
		description: `I plan to walk one hundred thousand miles, or die trying. I do not care about charity; only about punishing my feet, which I perceive to have wronged me.`,
	};

	item.photo = 'https://www.looktothestars.org/photo/11291-patrick-stewart-and-ginger/story_wide-1491424139.jpg';

	const donations = [
		{
			date: '2017-11-01T10:00Z',
			amount: MonetaryAmount.make({value: 10}),
			donorName: 'Berk Herkson',
			photo: 'http://bogleech.com/trapdoor/td-berk.jpg',
		},
		{
			date: '2017-11-03T10:00Z',
			amount: MonetaryAmount.make({value: 5}),
			donorName: 'Spoon McGuffin',
			photo: 'http://www.geminieventrentals.com/wp-content/uploads/2015/01/King-Spoon-500x500.jpg',
		},
		{
			date: '2017-11-10T10:00Z',
			amount: MonetaryAmount.make({value: 20}),
			donorName: 'Joe Chill',
			photo: 'https://static.comicvine.com/uploads/original/11127/111278246/5090739-2402727027-latest',
		},
		{
			date: '2017-11-20T10:00Z',
			amount: MonetaryAmount.make({value: 30}),
			donorName: 'Fork McGuffin',
			photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Tranchergaffel%2C_1640-tal_-_Skoklosters_slott_-_102831.tif/lossy-page1-220px-Tranchergaffel%2C_1640-tal_-_Skoklosters_slott_-_102831.tif.jpg',
		},
		{
			date: '2017-11-29T10:00Z',
			amount: MonetaryAmount.make({value: 5}),
			donorName: 'Thomas Wayne',
			photo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/Thomas_Wayne.png/250px-Thomas_Wayne.png',
		},
	];

	return (
		<Grid id='FundraiserPage'>
			<Row className='title-bar'>
				<Col md={12}>
					<h2>{item.owner.name}&apos;s {item.name} {(new Date(item.date)).toLocaleString('en-GB')}</h2>
				</Col>
			</Row>
			<Row className='vitals'>
				<Col md={6} className='user-event-photo'>
					<img src={item.photo} />
				</Col>
				<Col md={6} className='donation-progress'>
					<div className='progress-graph'>
						<div className='target'>Target: <Misc.Money amount={item.target} /></div>
						<div className='bar-container'>
							<div className='progress-pointer value'>
								<Misc.Money amount={item.donated} />
								<Glyphicon glyph='triangle-right' />
							</div>
							<div className='progress-bar' style={{height: '100px'}}>
								<div className='remaining' style={{backgroundColor: 'silver', height: (100*(1-donatedProportion))+'%'}}>&nbsp;</div>
								<div className='done' style={{backgroundColor: 'powderblue', height: (100*donatedProportion)+'%'}}>&nbsp;</div>
							</div>
							<div className='progress-pointer percent'>
								<Glyphicon glyph='triangle-left' />
								{Math.round(donatedProportion)}%
							</div>
						</div>
					</div>
					<div className='progress-details'>
						<div className='details-input'>
							<div className='amount'>£768</div>
							raised of <Misc.Money amount={item.target} /> by {donations.length} supporters
						</div>
						<div className='details-output'>
							<div className='first-impact'>
								<span className='amount'>99 people</span> turned into frogs by witches
							</div>
							<div className='second-impact'>
								<span className='amount'>25</span> local ponds repopulated with friendly amphibians
							</div>
						</div>
						<NewDonationForm item={item} />
					</div>
				</Col>
			</Row>
			<Row>
				<Col md={6}>
					<h3>Who I am:</h3>
					<img src={item.owner.photo} />
					<p>{item.owner.description}</p>
				</Col>
				<Col md={6}>
					<h3>The Charity:</h3>
					<img src='http://www.halotrust.org/images/SiteLogo.svg' />
					<p>The Halo Trust is being used as a placeholder while we decide how precisely to structure the data model behind fundraiser pages.</p>
				</Col>
			</Row>
			<Row>
				<Col md={6}></Col>
				<Col md={6}></Col>
			</Row>
		</Grid>
	);
};

const OldFundraiserPage = ({item, id}) => (
	<div>
		<h2>{item.name || 'Fundraiser '+id} </h2>		
		<p><small>ID: {id}</small></p>
		<img src={item.img} className='img-thumbnail' alt='fundraiser pic' />
		<div>
			{item.description}
		</div>
		<NewDonationForm item={item} />
	</div>
);

export default FundRaiserPage;
