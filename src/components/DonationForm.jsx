

/**
 * 
 * TODO
 * Refactor impact widgets into ImpactWidgetry.jsx
 * Anything remaining into CharityPage
 * 
 */

// @Flow
import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
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
import Project from '../data/charity/Project';
import Output from '../data/charity/Output';
import Money from '../data/charity/Money';

import Misc from './Misc';
import { impactCalc } from './ImpactWidgetry.jsx';
import GiftAidForm from './GiftAidForm';
import SocialShare from './SocialShare.jsx';
import NewDonationForm, {DonateButton} from './NewDonationForm';


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

	// Bump the donation up or down by a "reasonable" amount for current value
	// ...and round it to a clean multiple of the increment used
	incrementDonation(amount, sign, charity) {
		Money.assIsa(amount);
		NGO.assIsa(charity);
		const incrementKey = Object.keys(donationIncrements)
			.sort((a, b) => a - b)
			.find((key) => sign > 0 ? key > amount : key >= amount); // so that £20+ goes to £25, £20- goes to £19
		const increment = donationIncrements[incrementKey];
		const rawValue = amount + (increment * Math.sign(sign));
		const value = Math.max(increment * Math.round(rawValue / increment), 1);
		const newAmount = Money.make({ value, currency: 'gbp' });
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
		const amountPath = formPath.concat('amount');
		let amount = DataStore.getValue(amountPath);
		if ( ! amount) {
			amount = Money.make({value:10});
			DataStore.setValue(amountPath, amount, false);
		}
		const user = Login.getUser();

		// impact info
		const project = NGO.getProject(charity);
		// NB: no project = no impact data, but you can still donate
		let impact;
		if (project) {
			const outputs = Project.outputs(project);
			impact = impactCalc({ charity, project, output:outputs[0], cost: amount });
		}
		if ( ! impact) { // the display will fallback to "funds the charity"
			// impact = { name: NGO.displayName(charity) };
		}

		const donationDown = () => this.incrementDonation(amount.value, -1, charity);
		const donationUp = () => this.incrementDonation(amount.value, 1, charity);

		return (
			<div className='donation-impact'>
				<div className='project-image'>
					<img src={project && project.images} alt='' />
				</div>
				<div className='row donation-io-row'>
					<div className='col-sm-6 left-column'>
						<div className='donation-buttons'>
							<img className='donation-sun' src='/img/donation-bg.svg' alt="" />
							<button onClick={donationUp} className='donation-up'>+</button>
							{' '}
							<button onClick={donationDown} className='donation-down'>-</button>
						</div>
						<div className='donation-input'>
							<div className='amount-input'>
								<Misc.PropControl type='Money' prop='amount' 
									path={['widget', 'DonationForm', NGO.id(charity)]} changeCurrency={false} />
							</div>
							<div className='will-fund'>may fund</div>
							<img className='donation-hand' src='/img/donation-hand.png' alt='' />
						</div>
						<img className='donation-arrow-right' src='/img/donation-arrow-right.png' alt="" />
					</div>
					<div className='col-sm-6 right-column'>
						<DonationOutput impact={impact} charity={charity} />
					</div>
				</div>

				<img className='donation-arrow-down' src='/img/donation-arrow-down-wide.png' alt="" />
				
				<div className='below-arrow'>
					<div className='donate-button'>
						<DonateButton item={charity} />
						<NewDonationForm item={charity} />
					</div>
				</div>
				<div className='clearfix' />
			</div>
		);
	}
} // ./DonationForm

const DonationOutput = ({impact, charity}) => {
	if ( ! impact) {
		return (<div className='donation-output'>
			<h3>{NGO.name(charity)}</h3>
			<ReactMarkdown source={NGO.shortDescription(charity)} />
		</div>);	
	}

	return (<div className='donation-output'>
		<center>
			{impact.number ? <div className='output-number'>
				{printer.prettyNumber(impact.number, 2)}
			</div> : null}
			<div className='output-units'>
				{Output.name(impact)}
			</div>
		</center>
	</div>);
};

export default DonationForm;
