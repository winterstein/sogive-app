

/**
 *
 * TODO
 * Refactor impact widgets into ImpactWidgetry.jsx
 * Anything remaining into CharityPage
 *
 */

// @Flow
import React, { Component } from 'react';
import { assert } from 'sjtest';
import Login from '../you-again';

import MDText from '../base/components/MDText';

import printer from '../base/utils/printer';
import DataStore from '../base/plumbing/DataStore';
import NGO from '../data/charity/NGO2';
import Project from '../data/charity/Project';
import Output from '../data/charity/Output';
import Money from '../base/data/Money';

import Misc from '../base/components/Misc';
import { impactCalc } from './ImpactWidgetry';
import { DonateButton } from './DonationWizard';


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

// TODO refactor into a function
class CharityPageImpactAndDonate extends Component {

	// Bump the donation up or down by a "reasonable" amount for current value
	// ...and round it to a clean multiple of the increment used
	incrementDonation(amount, sign, charity) {
		Money.assIsa(amount);
		NGO.assIsa(charity);
		const incrementKey = Object.keys(donationIncrements)
			.sort((a, b) => a - b)
			.find((key) => sign > 0 ? key > amount.value : key >= amount.value); // so that £20+ goes to £25, £20- goes to £19
		const increment = donationIncrements[incrementKey];
		// use Money.add/sub instead??
		const rawValue = Money.value(amount) + (increment * Math.sign(sign));
		const value = Math.max(increment * Math.round(rawValue / increment), 1);
		const newAmount = new Money({ value, currency: 'GBP' });
		DataStore.setValue(['widget', 'CharityPageImpactAndDonate', NGO.id(charity), 'amount'], newAmount);
	}


	render() {
		const {charity} = this.props;
		assert(NGO.isa(charity), charity);

		// some charities dont accept donations
		if (charity.noPublicDonations) {
			const reason = charity.meta && charity.meta.noPublicDonations && charity.meta.noPublicDonations.notes;
			return (
				<div className="CharityPageImpactAndDonate noPublicDonations">
					<p>Sorry: This charity does not accept public donations.</p>
					{reason ? (<p>The stated reason is: {reason}</p>) : ''}
				</div>
			);
		}

		// donation info
		let cid = NGO.id(charity);
		if ( ! cid) {
			// paranoia - DA reported an undefined bug Sep 2019 - maybe a race condition?
			console.error("No Charity ID?!",charity);
			return <div />;
		}
		const formPath = ['widget', 'CharityPageImpactAndDonate', cid];
		const formData = DataStore.getValue(formPath) || {};
		const amountPath = formPath.concat('amount');
		let amount = DataStore.getValue(amountPath);
		if ( ! amount) {
			amount = new Money({value:10});
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
		// if ( ! impact) { // the display will fallback to "funds the charity"
		// 	impact = { name: NGO.displayName(charity) };
		// }

		const donationDown = () => this.incrementDonation(amount, -1, charity);
		const donationUp = () => this.incrementDonation(amount, 1, charity);

		return (
			<div className='donation-impact'>
				{project && project.images ? (
					<div className='project-image'>
						<img src={project.images} alt='' />
					</div>
				) : null}
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
									path={formPath} changeCurrency={false} />
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
					</div>
				</div>
				<div className='clearfix' />
			</div>
		);
	}
} // ./CharityPageImpactAndDonate

const DonationOutput = ({impact, charity}) => {
	if ( ! impact) {
		return (<div className='donation-output'>
			<h3>{NGO.getName(charity)}</h3>
			<MDText source={NGO.shortDescription(charity)} />
		</div>);
	}

	return (<div className='donation-output'>
		<center>
			{impact.number ? <div className='output-number'>
				{printer.prettyNumber(impact.number, 2)}
			</div> : null}
			<div className='output-units'>
				{Output.getName(impact)}
			</div>
		</center>
	</div>);
};

export default CharityPageImpactAndDonate;
