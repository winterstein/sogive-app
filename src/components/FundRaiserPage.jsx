import React from 'react';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import { Clearfix, Grid, Row, Col, Button, Glyphicon } from 'react-bootstrap';

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
	let pEvent = ActionMan.getDataItem({type:type, id:id, status:C.KStatus.DRAFT}); // TODO published
	console.warn(pEvent);
	if ( ! pEvent.resolved) {
		return <Misc.Loading />;
	}
	let item = pEvent.value || {};

	// Let's set up all the data that might not be in the model yet...
	item.name = item.name || 'PlaceholderWalk';
	item.date = item.date || '2018-02-14';
	item.banner = item.banner || '/img/kiltwalk/KW_generic_supporter_banner.png';
	item.target = item.target || MonetaryAmount.make({value: 1000});
	item.donated = item.donated || MonetaryAmount.make({value: 768});

	const donatedPercent = 100 * (item.donated.value / item.target.value);
	const remainingPercent = 100 - donatedPercent;

	item.owner = {
		name: 'Patrick',
		img: 'https://www.famousbirthdays.com/headshots/patrick-stewart-5.jpg',
		description: `I plan to walk one hundred thousand miles, or die trying. I do not care about charity; only about punishing my feet, which I perceive to have wronged me.`,
	};

	item.img = 'https://www.looktothestars.org/photo/11291-patrick-stewart-and-ginger/story_wide-1491424139.jpg';

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
			<Grid id='FundRaiserPage'>
				<Row>
					<Col md={12} className='event-banner'>
						<img alt={`Banner for ${item.name}`} src={item.banner} />
					</Col>
				</Row>
				<Row className='title-bar'>
					<Col md={12}>
						<h2>{item.owner.name}&apos;s {item.name} {(new Date(item.date)).toLocaleString('en-GB')}</h2>
					</Col>
				</Row>
				<Row className='vitals'>
					<Col md={6}>
						<div className='user-event-photo'>
							<img alt={`${item.owner.name}'s photo for ${item.name}`} src={item.img} />
						</div>
					</Col>
					<Col md={6} className='donation-progress'>
						<div className='progress-graph'>
							<div className='target'>Target: <Misc.Money amount={item.target} /></div>
							<div className='bar-container'>
								<div className='progress-pointer value' style={{bottom: donatedPercent+'%'}}>
									<Misc.Money amount={item.donated} />
									<Glyphicon glyph='triangle-right' />
								</div>
								<div className='donation-progress-bar'>
									<div className='remaining' style={{height: remainingPercent+'%'}}>&nbsp;</div>
									<div className='done' style={{height: donatedPercent+'%'}}>&nbsp;</div>
								</div>
								<div className='progress-pointer percent' style={{bottom: donatedPercent+'%'}}>
									<Glyphicon glyph='triangle-left' />
									{Math.round(donatedPercent)}%
								</div>
							</div>
						</div>
						<div className='progress-details'>
							<div className='details-input'>
								<div className='amount'>£768</div>
								raised of <Misc.Money amount={item.target} /> by {supporters.length} supporters
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
				<div className='clear' />
				<Row>
					<Col md={6} className='me'>
						<h3>Who I am:</h3>
						<img className='avatar' alt={`Avatar for ${item.owner.name}`} src={item.owner.img} />
						<p>{item.owner.description}</p>
					</Col>
					<Col md={6} className='charity-info'>
						<h3>The Charity:</h3>
						<img className='charity-logo' alt={`Logo for ${'Placeholder Charity'}`} src='http://www.halotrust.org/images/SiteLogo.svg' />
						<p>The Halo Trust is being used as a placeholder while we decide how precisely to structure the data model behind fundraiser pages.</p>
					</Col>
				</Row>
				<Row>
					<Col md={6}>
						<h3>Story:</h3>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent quis pulvinar magna, sed porta ex. Duis rhoncus eros tempor turpis efficitur, ut dignissim sapien suscipit. Vestibulum suscipit aliquet mauris. Nam volutpat pellentesque ligula, a interdum velit malesuada at. Nulla dictum nisl sit amet leo cursus euismod. Nunc ullamcorper metus eu lectus pellentesque, ac vestibulum augue mollis. Vivamus a euismod massa. Nullam rhoncus justo dui, id sollicitudin purus placerat vel.</p>
						<p>In vel est odio. Fusce felis leo, molestie eget iaculis ac, tincidunt quis velit. Nam quis ligula consectetur, fermentum lacus ac, euismod ante. Aenean non neque nisi. Morbi leo nibh, pulvinar at sapien ac, vulputate aliquet odio. Curabitur at egestas dolor, eu consectetur lorem. In lectus nibh, auctor at sapien at, lobortis egestas metus. Vivamus orci libero, hendrerit et ligula nec, tempus posuere augue. Quisque ultricies ante a mi imperdiet, sed bibendum justo fermentum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi feugiat pellentesque ligula, eget finibus orci sagittis vel. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aenean tincidunt faucibus velit a iaculis. Pellentesque volutpat dui a ipsum tincidunt, ut iaculis nunc hendrerit.</p>
						<p>Vivamus ut odio accumsan, convallis sapien a, egestas enim. Nam congue arcu nisl, quis porta risus iaculis ac. Cras at scelerisque neque, sed commodo justo. Maecenas vitae pulvinar nunc. Nullam aliquet, magna ut facilisis interdum, velit est semper urna, ac sodales orci nunc eget mauris. Sed molestie elit nunc, vel tincidunt nunc aliquam sit amet. Praesent fringilla justo id nunc porta tempor. Morbi ipsum sapien, placerat sit amet ullamcorper eu, lacinia non velit. Integer dapibus sodales ligula vitae egestas. Integer sagittis elit consectetur ex commodo faucibus. Suspendisse massa magna, tincidunt ac dignissim et, faucibus sed orci. Vivamus lectus risus, dapibus at purus quis, dignissim facilisis nulla. Etiam ac commodo augue, sed lacinia lorem. Nam orci elit, volutpat in nunc sit amet, bibendum aliquet est. In mollis diam mi.</p>
					</Col>
					<Col md={6}>
						<h3>Supporters:</h3>
						<Supporters item={item} supporters={supporters} charity={/*charity*/ null} />
						<NewDonationForm item={item} />
					</Col>
				</Row>
			</Grid>
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
