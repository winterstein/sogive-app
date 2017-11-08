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
import { impactCalc } from './ImpactWidgetry.jsx';
import GiftAidForm from './GiftAidForm';
import SocialShare from './SocialShare.jsx';

/**
 * 
 * TODO Doc notes on the inputs to this. the charity profile sends in charity and project.
 */


const initialFormData = {
	amount: MonetaryAmount.make({ value: 10, currency: 'gbp' }),
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

const donationReady = (formData) => {
	console.warn("donationReady", formData);
	// have to be donating something
	if (!formData.amount || formData.amount.value <= 0) return false;
	if (!formData.giftAid) return true;
	// if gift-aiding, must have checked all confirmations & supplied name/address
	return (
		formData.giftAidTaxpayer &&
		formData.giftAidOwnMoney &&
		formData.giftAidNoCompensation &&
		(formData.name.trim().length > 0) &&
		(formData.address.trim().length > 0) &&
		(formData.postcode.trim().length > 0)
	);
};

// The +/- buttons don't just work linearly - bigger numbers = bigger jumps
// Amount up to {key} => increment of {value}
const donationIncrements = {
	10: 1,
	50: 5,
	100: 10,
	500: 50,
	1000: 100,
	5000: 500,
	10000: 1000,
	50000: 5000,
	Infinity: 10000,
};

class DonationForm extends Component {

	componentWillMount() {
		const charity = this.props.charity;
		// Set default donation amount etc.
		DataStore.setValue(['widget', 'DonationForm', NGO.id(charity)], initialFormData);
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
		DataStore.setValue(['widget', 'DonationForm', NGO.id(charity), 'amount'], newAmount);
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
					{reason ? (<p>The stated reason is: {reason}</p>) : ''}
				</div>
			);
		}

		// donation info
		const formPath = ['widget', 'DonationForm', NGO.id(charity)];
		const formData = DataStore.getValue(formPath) || {};
		const { amount } = formData;
		const user = Login.getUser();

		// impact info
		const project = NGO.getProject(charity);
		// NB: no project = no impact data, but you can still donate
		let impact;
		if (project) {
			const { outputs } = project;
			impact = impactCalc({ charity, project, outputs, amount: amount.value });
		}
		if (!impact) {
			impact = { unitName: NGO.displayName(charity) };
		}

		// donated?
		if (formData.complete || DataStore.getUrlValue('forceState') === 'tq') {
			return (<ThankYouAndShare thanks user={user} charity={charity} donationForm={formData} project={project} />);
		}

		const donateButton = donationReady(formData) ? (
			<DonationFormButton
				amount={Math.floor(formData.amount * 100)}
				onToken={(stripeResponse) => { ActionMan.donate({ charity, formPath, formData, stripeResponse }); } }
				/>
		) : (
				<Button disabled bsSize='large' title={`Please check your donation amount and, if you want to add Gift Aid, make sure you've filled out every field in the form.`} >donate</Button>
			);

		const giftAidForm = charity.uk_giftaid ? (
			<GiftAidForm formPath={formPath} />
		) : (
				<div className='col-xs-12 gift-aid'>
					<small >This charity is not eligible for Gift-Aid.</small>
				</div>
			);

		const donationDown = () => this.incrementDonation(formData.amount.value, -1, charity);
		const donationUp = () => this.incrementDonation(formData.amount.value, 1, charity);

		return (
			<div className='donation-impact'>
				<div className='project-image'>
					<img src={project && project.images} alt='' />
				</div>
				<div className='row'>
					<div className='col-sm-6 left-column'>
						<div className='donation-buttons'>
							<img className='donation-sun' src='/img/donation-bg.svg' alt="" />
							<button onClick={donationUp} className='donation-up'>+</button>
							{' '}
							<button onClick={donationDown} className='donation-down'>-</button>
						</div>
						<div className='donation-input'>
							<div className='prefix'>{impact.prefix || '\u00A0'}</div> {/* nbsp if no prefix so the line still has height */}
							<div className='amount-input'>
								<Misc.PropControl type='MonetaryAmount' prop='amount' path={['widget', 'DonationForm', NGO.id(charity)]} changeCurrency={false} />
							</div>
							<div className='will-fund'>will fund</div>
							<img className='donation-hand' src='/img/donation-hand.png' alt='' />
						</div>
						<img className='donation-arrow-right' src='/img/donation-arrow-right.png' alt="" />
					</div>
					<div className='col-sm-6 right-column'>
						<div className='donation-output'>
							{impact.impactNum ? <div className='output-number'>
								{printer.prettyNumber(impact.impactNum, 2)}
							</div> : null}
							<div className='output-units'>
								{impact.unitName}
							</div>
						</div>
					</div>
				</div>
				<img className='donation-arrow-down' src='/img/donation-arrow-down.png' alt="" />
				<div className='below-arrow'>
					{giftAidForm}
					<div className='donate-button'>
						{donateButton}
					</div>
				</div>
				<div className='clearfix' />
			</div>
		);
	}
} // ./DonationForm


const ThankYouAndShare = ({thanks, user, charity, donationForm, project}) => {

	// TODO -- see submit methodlet impacts = Output.getDonationImpact;
	let shareText = `Help to fund ${charity.name} and see the impact of your donations on SoGive:`;
	if (user && user.name) {
		let impact = false; // TODO
		if (impact) {
			shareText = `${charity.name} and SoGive thank ${user.name} for helping to fund ${impact} - why not join in?`;
		} else {
			shareText = `${charity.name} and SoGive thank ${user.name} for their donation - why not join in?`;
		}
	}

	const header = thanks ? <h3>Thank you for donating!</h3> : '';

	// NB: the charity page has share buttons on it already -- lets not have x2

	return (
		<div className='col-md-12'>
			<div className='ThankYouAndShare panel-success'>
				{header}

				<p>Share this on social media?<br />
					We expect this will lead to 2-3 times more donations on average.</p>
			</div>
		</div>
	);
}; // ./ThankYouAndShare

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
			<StripeCheckout name="SoGive"
				description="Donate with impact tracking"
				image="https://app.sogive.org/img/SoGive-Light-64px.png"
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
		<span key={'donate_' + price}>
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

	return (
		<div className='full-width'>
			<form>
				<div className="form-group col-md-1 col-xs-2">
					{damounts}
				</div>
				<div className="form-group col-md-8 col-xs-10">
					<InputGroup>
						<InputGroup.Addon style={{ color: fgcol, backgroundColor: bgcol }}>£</InputGroup.Addon>
						<FormControl
							type="number"
							min="1"
							max="100000"
							step="1"
							placeholder="Enter donation amount"
							onChange={({ target }) => { handleChange('amount', target.value); } }
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

const DonationAmount = function ({selected, price, handleChange}) {
	return (
		<div className=''>
			<Button
				bsStyle={selected ? 'primary' : null}
				bsSize="sm"
				className='amount-btn'
				onClick={() => handleChange('amount', price)}
				>
				£ {price}
			</Button>
		</div>
	);
};


// const DonationList = ({donations}) => {
// 	let ddivs = _.map(donations, d => <li key={d.id || JSON.stringify(d)}>{d}</li>);
// 	return <ul>{ddivs}</ul>;
// };

export default DonationForm;
