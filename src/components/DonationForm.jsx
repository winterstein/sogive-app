// @Flow
import React, { Component } from 'react';
import _ from 'lodash';
import { assert } from 'sjtest';
import Login from 'you-again';
import StripeCheckout from 'react-stripe-checkout';
import { uid, XId } from 'wwutils';
import { Button, FormControl, InputGroup } from 'react-bootstrap';

import printer from '../utils/printer';
import ActionMan from '../plumbing/ActionMan';
import DataStore from '../plumbing/DataStore';
import NGO from '../data/charity/NGO';
import MonetaryAmount from '../data/charity/MonetaryAmount';

import Misc from './Misc';
import ImpactWidgetry from './ImpactWidgetry';
import GiftAidForm from './GiftAidForm';

/**
 * TODO refactor this to not use Redux.
 * 
 * TODO Doc notes on the inputs to this. the charity profile sends in charity and project.
 */


const initialFormData = {
	amount: MonetaryAmount.make({value: 10, currency: 'gbp'}),
	giftAid: false,
	giftAidTaxpayer: false,
	giftAidOwnMoney: false,
	giftAidNoCompensation: false,
	name: '',
	address: '',
	postcode: '',
	pending: false,
	complete: false,
};

const donationReady = (formData) => (
	// have to be donating something
	(
		formData.amount &&
		formData.amount.value > 0
	) &&
	// if gift-aiding, must have checked all confirmations & supplied name/address
	(
		!formData.giftAid ||
		(
			formData.giftAidTaxpayer &&
			formData.giftAidOwnMoney &&
			formData.giftAidNoCompensation &&
			(formData.name.trim().length > 0) &&
			(formData.address.trim().length > 0) &&
			(formData.postcode.trim().length > 0)
		)
	)
);

// The +/- buttons don't just work linearly - bigger numbers = bigger jumps
const donationIncrements = {
	20: 1,
	50: 5,
	200: 10,
	500: 50,
	2000: 100,
	5000: 500,
	20000: 1000,
	50000: 5000,
	Infinity: 10000,
};

class DonationForm extends Component {

	componentWillMount() {
		const charity = this.props.charity;
		// Set default donation amount etc.
		DataStore.setValue(['widget','DonationForm', NGO.id(charity)], initialFormData);
	}


	// Bump the donation up or down by a "reasonable" amount for current value
	// ...and round it to a clean multiple of the increment used
	incrementDonation(amount, sign, charity) {
		const incrementKey = Object.keys(donationIncrements)
		.sort((a, b) => a - b)
		.find((key) => sign > 0 ? key > amount : key >= amount); // so that £20+ goes to £25, £20- goes to £19
		const increment = donationIncrements[incrementKey];
		const rawValue = amount + (increment * Math.sign(sign));
		const value = Math.max(increment * Math.round(rawValue / increment), 1);
		const newAmount = MonetaryAmount.make({ value, currency: 'gbp' });
		DataStore.setValue(['widget','DonationForm', NGO.id(charity), 'amount'], newAmount);
	}


	render() {
		const {charity} = this.props;
		assert(NGO.isa(charity), charity);

		// some charities dont accept donations
		if (charity.noPublicDonations) {
			const reason = charity.meta && charity.meta.noPublicDonations && charity.meta.noPublicDonations.notes;
			return (
				<div className="DonationForm noPublicDonations">
					<p>Sorry: This charity does not accept public donations.</p>
					{ reason? (<p>The stated reason is: {reason}</p>) : '' }
				</div>
			);
		}

		const project = NGO.getProject(charity);
		// NB: no project = no data is possible
		if ( ! project) {
			return <div />;
		}
		const { outputs } = project;
		const user = Login.getUser();
		const formPath = ['widget','DonationForm', NGO.id(charity)];

		const formData = DataStore.getValue(formPath) || {};
		const { amount } = formData;
		
		const impact = Misc.impactCalc({charity, project, outputs, amount: amount.value});

		// donated?
		if (formData.complete) {
			return (<ThankYouAndShare thanks user={user} charity={charity} donationForm={formData} project={project} />);
		}

		const donateButton = donationReady(formData) ? (
			<DonationFormButton
				amount={Math.floor(formData.amount * 100)}
				onToken={(stripeResponse) => { ActionMan.donate({charity, formPath, formData, stripeResponse}); }}
			/>
		) : (
			<Button disabled bsSize='large' title={`Please check your donation amount and, if you want to add Gift Aid, make sure you've filled out every field in the form.`} >donate</Button>
		);

		const giftAidForm = charity.uk_giftaid ? (
			<GiftAidForm formPath={formPath} />
		) : <small>This charity is not eligible for Gift-Aid.</small>;

		/*
		return (
			<div>
				<ThankYouAndShare thanks={false} charity={charity} />
			</div>
		);*/

		const donationDown = () => this.incrementDonation(formData.amount.value, -1, charity);
		const donationUp = () => this.incrementDonation(formData.amount.value, 1, charity);

		return (
			<div className='donation-impact'>
				<div className='project-image'>
					<img src={project.images} />
				</div>
				<div className='row'>
					<div className='col-xs-5'>
						<div className='donation-buttons'>
							<img className='donation-sun' src='/img/donation-bg.svg' />
							<button onClick={donationUp} className='donation-up'>+</button>
							{' '}
							<button onClick={donationDown} className='donation-down'>-</button>
						</div>
						<div className='donation-input'>
							<div className='prefix'>{impact.prefix}</div>
							<div className='amount-input'>
								<Misc.PropControl type='MonetaryAmount' prop='amount' path={['widget','DonationForm', NGO.id(charity)]} changeCurrency={false} />
							</div>
							<div className='will-fund'>will fund</div>
							<img src="/img/donation-hand.png" />
						</div>
					</div>
					<div className='col-xs-7'>
						<div className='donation-output'>
							<img className='donation-arrow-right' src='/img/donation-arrow-right.svg' />
							<div className='output-number'>
								{printer.prettyNumber(impact.impactNum)}
							</div>
							<div className='output-units'>
								{impact.unitName}
							</div>
						</div>
					</div>
				</div>
				<img className='donation-arrow-down' src='/img/donation-arrow-down.svg' />
				{giftAidForm}
				<div className='donate-button'>
					{ donateButton }
				</div>
				<div className='clearfix' />
			</div>
		);
	}
} // ./DonationForm


class ThankYouAndShare extends Component {

	constructor(...params) {
		super(...params);
		const { thanks, user, charity, donationForm, project} = this.props;

		// TODO -- see submit methodlet impacts = Output.getDonationImpact;
		let shareText;
		if (user && user.name) {
			let impact = false; // TODO
			if (impact) {
				shareText = `${charity.name} and SoGive thank ${user.name} for helping to fund ${impact} - why not join in?`;
			} else {
				shareText = `${charity.name} and SoGive thank ${user.name} for their donation - why not join in?`;
			}
		} else {
			shareText = `Help to fund ${charity.name} and see the impact of your donations on SoGive:`;
		}

		this.state = {
			shareText,
		};
	}

	shareOnFacebook({url}) {
		FB.ui({
			quote: this.state.shareText,
			method: 'share',
			href: url,
			},
			// callback
			function(response) {
				console.log("FB", response);
				if (response && response.error_message) {
					console.error('Error while posting.');
					return;
				}
				// foo
			}
		);
	}

	onChangeShareText(event) {
		event.preventDefault();
		console.log("event", event);
		this.setState({shareText: event.target.value});
	}

	render() {
		const { thanks } = this.props;
		const { shareText } = this.state;
	/*
	<div className="fb-share-button"
		data-href={url}
		data-layout="button_count"
		data-size="large" data-mobile-iframe="true"><a className="fb-xfbml-parse-ignore" target="_blank"
		href={"https://www.facebook.com/sharer/sharer.php?u="+escape(url)}>Share</a>
	</div>
	*/

		let lcn = window.location;
		const header = thanks ? <h3>Thank you for donating!</h3> : '';
		
		let pageInfo = {
			title: this.props.charity.name,
			image:	'http://cdn.attackofthecute.com/September-21-2011-22-10-11-6765.jpeg', // FIXME
			desc:	this.props.charity.description
		};
		// TODO copy SoDash escape fn into wwutils
		// TODO make this line nicer
		// TODO just send the charity ID, and load the rest server side, to give a nicer url
		// Also window.location might contain parameters we dont want to share.
		let url = "https://app.sogive.org/share?link="+escape(""+window.location)+"&title="+escape(pageInfo.title)+"&image="+escape(pageInfo.image)+"&desc="+escape(pageInfo.desc);
		pageInfo.url = url;

		return (
			<div className='col-md-12'>
				<div className='ThankYouAndShare panel-success'>
					{ header }

					<p>Share this on social media?<br/>
						We expect this will lead to 2-3 times more donations on average.</p>
					
					<textarea
						className='form-control'
						onChange={() => { this.onChangeShareText(); }}
						defaultValue={shareText}
					/>
				</div>
				<div className='col-md-12 social-media-buttons'>
					<center>
						<a className='btn twitter-btn' href={'https://twitter.com/intent/tweet?text='+escape(this.state.shareText)+'&url='+escape(url)} data-show-count="none">
							<Misc.Logo service='twitter' />
						</a>

						<a className='btn facebook-btn' onClick={() => { this.shareOnFacebook(pageInfo); }}>
							<Misc.Logo service='facebook' />
						</a>
					</center>
				</div>
			</div>
		);
	}
} // ./ThankYouAndShare

/**
 * one-click donate, or Stripe form?
 */
const DonationFormButton = ({onToken, amount}) => {
	let email = Login.getId('Email');
	if (email) email = XId.id(email);
		const stripeKey = (window.location.host.startsWith('test') || window.location.host.startsWith('local')) ?
		'pk_test_RyG0ezFZmvNSP5CWjpl5JQnd' // test
		: 'pk_live_InKkluBNjhUO4XN1QAkCPEGY'; // live
		
	return (
		<div className='stripe-checkout'>
			<StripeCheckout name="SoGive" description="Donate with impact tracking"
				image="http://local.sogive.org/img/SoGive-Light-64px.png"
				email={email}
				panelLabel="Donate"
				amount={amount}
				currency="GBP"
				stripeKey={stripeKey}
				bitcoin
				allowRememberMe
				token={onToken}
			>
				<center>
					<Button bsSize="large">donate</Button>
				</center>
			</StripeCheckout>
		</div>
	);
};


/**
 */
const DonationAmounts = ({options, charity, project, outputs, amount, handleChange}) => {
	// FIXME switch to using outputs
	let damounts = _.map(options, price => (
		<span key={'donate_'+price}>
			<DonationAmount
				price={price}
				selected={price === amount}
				handleChange={handleChange}
			/>
			&nbsp;
		</span>
	));

	let fgcol = (options.indexOf(amount) === -1) ? 'white' : null;
	let bgcol = (options.indexOf(amount) === -1) ? '#337ab7' : null;

	return(
		<div className='full-width'>
			<form>
				<div className="form-group col-md-1 col-xs-2">
					{damounts}
				</div>
				<div className="form-group col-md-8 col-xs-10">
					<InputGroup>
						<InputGroup.Addon style={{color: fgcol, backgroundColor: bgcol}}>£</InputGroup.Addon>
						<FormControl
							type="number"
							min="1"
							max="100000"
							step="1"
							placeholder="Enter donation amount"
							onChange={({ target }) => { handleChange('amount', target.value); }}
							value={amount}
						/>
					</InputGroup>
				</div>
				<div className="form-group col-md-2">
					<Misc.ImpactDesc charity={charity} project={project} outputs={outputs} amount={amount} />
				</div>
			</form>
		</div>
	);
};

const DonationAmount = function({selected, price, handleChange}) {
	return (
			<div className=''>
				<Button
					bsStyle={selected? 'primary' : null}
					bsSize="sm"
					className='amount-btn'
					onClick={() => handleChange('amount', price)}
				>
					£ {price}
				</Button>
			</div>
	);
};


const DonationList = ({donations}) => {
	let ddivs = _.map(donations, d => <li key={uid()}>{d}</li>);
	return <ul>{ddivs}</ul>;
};

export default DonationForm;
