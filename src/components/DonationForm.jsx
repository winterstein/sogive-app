// @Flow
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { assert } from 'sjtest';
import Login from 'hooru';
import StripeCheckout from 'react-stripe-checkout';
import { uid } from 'wwutils';
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import printer from '../utils/printer';
import NGO from '../data/charity/NGO';
import Misc from './Misc';
import GiftAidForm from './GiftAidForm';

import { donate } from './DonationForm-actions';
import { updateField } from './genericActions';


class DonationForm extends React.Component {

	render() {
		const { user, charity, donation, handleChange, sendDonation } = this.props;

		assert(NGO.isa(charity), charity);

		let project = this.props.project || NGO.getProject(charity);
		assert(project, charity);

		// donated?
		if (donation.complete) {
			return (<ThankYouAndShare user={user} charity={charity} />);
		}

		const donationParams = {
			action: 'donate',
			charityId: charity['@id'],
			currency: 'GBP',
			giftAid: donation.giftAid,
			impact: donation.impact,
			total100: Math.floor(donation.amount * 100),
		};

		const donateButton = donation.ready ? (
			<DonationFormButton
				amount={Math.floor(donation.amount * 100)}
				onToken={(stripeResponse) => { sendDonation(donationParams, stripeResponse); }}
			/>
		) : (
			<Button disabled title='Something is wrong with your donation'>Donate</Button>
		);

		const giftAidForm = (charity.ukBased && charity.englandWalesCharityRegNum) ? (
			<GiftAidForm {...donation} handleChange={handleChange} />
		) : '';

		return (
			<div className='DonationForm'>
				<DonationAmounts
					options={[5, 10]}
					impacts={project.impacts}
					charity={charity}
					project={project}
					amount={donation.amount}
					handleChange={handleChange}
				/>
				{ giftAidForm }
				{ donateButton }
			</div>
		);
	}
}


class ThankYouAndShare extends React.Component {

	constructor(...params) {
		super(...params);
		const { user, charity } = this.props;
		// TODO: Turn impact data into "for funding $charity to $DO_THING"
		const shareText = (user && user.name) ?
			`SoGive thanks ${user.name} for funding ${charity.name}`
			: `I used SoGive to fund ${charity.name}!`;

		this.state = {
			shareText,
		};
	}

	shareOnFacebook() {
		let url = ""+window.location;
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
		const {shareText} = this.state;
	/*
	<div className="fb-share-button"
		data-href={url}
		data-layout="button_count"
		data-size="large" data-mobile-iframe="true"><a className="fb-xfbml-parse-ignore" target="_blank"
		href={"https://www.facebook.com/sharer/sharer.php?u="+escape(url)}>Share</a>
	</div>
	*/

		let url = `${window.location}`;
		return (<div className='ThankYouAndShare panel-success'>
			<h3>Thank you for donating!</h3>

			<p>Share this on social media? We expect this will lead to 2-3 times more donations on average.</p>

			<textarea
				className='form-control'
				onChange={() => { this.onChangeShareText(); }}
				defaultValue={shareText}
			/>

			<a className='btn btn-default' href={'https://twitter.com/intent/tweet?text='+escape(this.state.shareText)+'&url='+escape(url)}>
				<Misc.Logo service='twitter' />
			</a>

			<button className='btn btn-default' onClick={() => { this.shareOnFacebook(); }}>
				<Misc.Logo service='facebook' />
			</button>
		</div>);
	}
} // ./ThankYouAndShare

/**
 * one-click donate, or Stripe form?
 */
const DonationFormButton = ({onToken, amount}) => {
	if (false) {
		return <button>Donate</button>;
	}
	let email = Login.getId('Email');
	return (
		<div>
			<StripeCheckout name="SoGive" description="See the impact of your charity donations"
				image="http://local.sogive.org/img/SoGive-Light-64px.png"
				email={email}
				panelLabel="Donate"
				amount={amount}
				currency="GBP"
				stripeKey="pk_test_RyG0ezFZmvNSP5CWjpl5JQnd"
				bitcoin
				allowRememberMe
				token={onToken}
			>
				<Button bsStyle="primary">Donate</Button>
			</StripeCheckout>
			<small className="pull-right">
				Stripe test cards:<br />
				Good: 4000008260000000<br />
				Bad: 4000000000000069
			</small>
		</div>
	);
};


const DonationAmounts = ({options, impacts, amount, handleChange}) => {
	let unitImpact = impacts && impacts[0];
	const impactDesc = (unitImpact && unitImpact.number && unitImpact.name) ?
		`will fund ${printer.prettyNumber(unitImpact.number * amount)} ${unitImpact.name}`
		: '';
	let damounts = _.map(options, price => (
		<DonationAmount
			key={'donate_'+price}
			price={price}
			selected={price===amount}
			unitImpact={unitImpact}
			handleChange={handleChange}
		/>) );
	let bgcol = options.indexOf(amount)===-1? '#337ab7' : null;
	return(
		<div>
			<div className="flexbox-1row">
				{damounts}
				<InputGroup>
					<InputGroup.Addon style={{backgroundColor: bgcol}}>£</InputGroup.Addon>
					<FormControl
						type="number"
						min="0"
						step="1"
						placeholder="Enter donation amount"
						onChange={({ target }) => { handleChange('amount', target.value); }}
						value={amount}
					/>
				</InputGroup>
			</div>
			<div>
				{impactDesc}
			</div>
		</div>
	);
};

const DonationAmount = function({selected, price, handleChange}) {
	return (
			<Button
				bsStyle={selected? 'primary' : null}
				bsSize="small"
				onClick={() => handleChange('amount', price)}
			>
				£{price}
			</Button>
	);
};


const DonationList = ({donations}) => {
	let ddivs = _.map(donations, d => <li key={uid()}>{d}</li>);
	return <ul>{ddivs}</ul>;
};

const mapStateToProps = (state, ownProps) => ({
	...ownProps,
	donation: state.donationForm,
	user: state.login.user,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	handleChange: (field, value) => dispatch(updateField('DONATION_FORM_UPDATE', field, value)),
	sendDonation: (charityId, stripeResponse, amount) => dispatch(donate(dispatch, charityId, stripeResponse, amount)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DonationForm);
