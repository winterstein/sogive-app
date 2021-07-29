

/**
 *
 * TODO
 * Refactor impact widgets into ImpactWidgetry.jsx
 * Anything remaining into CharityPage
 *
 */

// @Flow
import React, { Component } from 'react';
import Login from '../base/youagain';

import MDText from '../base/components/MDText';

import printer from '../base/utils/printer';
import DataStore from '../base/plumbing/DataStore';
import NGO from '../data/charity/NGO2';
import Project from '../data/charity/Project';
import Output from '../data/charity/Output';
import Money from '../base/data/Money';

import Misc from '../base/components/Misc';
import { impactCalc } from './ImpactWidgetry';
import { assert } from '../base/utils/assert';



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
class ImpactCalculator extends Component {

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
		DataStore.setValue(['widget', 'ImpactCalculator', NGO.id(charity), 'amount'], newAmount);
	}


	render() {
		const {charity} = this.props;
		assert(NGO.isa(charity), charity);

		// some charities dont accept donations
		if (charity.noPublicDonations) {
			const reason = charity.meta && charity.meta.noPublicDonations && charity.meta.noPublicDonations.notes;
			return (
				<div className="ImpactCalculator noPublicDonations">
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
		const formPath = ['widget', 'ImpactCalculator', cid];
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
			<div className='donation-impact std-border std-padding std-box-shadow '>
				<button onClick={donationDown} className='donation-down'>-</button>
				<Misc.PropControl type='Money' prop='amount' path={formPath} changeCurrency={false} rawValue={null}/>
				<button onClick={donationUp} className='donation-up'>+</button>
				<div className='will-fund div-section-larger-text'>can fund</div>
				<DonationOutput impact={impact} charity={charity} />
				<p className='div-section-text donation-description'><i>{impact ? impact.description : null}</i></p>

			</div>
		);
	}
} // ./ImpactCalculator

const DonationOutput = ({impact, charity}) => {
	if ( ! impact) {
		return (<div className='donation-output'>
			<h3>{NGO.getName(charity)}</h3>
			<MDText source={NGO.shortDescription(charity)} />
		</div>);
	}

	return (
	<>
			{impact.number ? <div className='output-number'>
				{printer.prettyNumber(impact.number, 2)}
			</div> : null}
			<div className='output-units div-section-larger-text'>
				{Output.getName(impact)}
			</div>

	</>);
};

export default ImpactCalculator;
