// @Flow
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import SJTest, {assert} from 'sjtest';
import Login from 'hooru';
import StripeCheckout from 'react-stripe-checkout';
import { XId, uid } from 'wwutils';
import { Button, FormControl } from 'react-bootstrap';

import ServerIO from '../plumbing/ServerIO';
import printer from '../utils/printer.js';
import C from '../C.js';
import NGO from '../data/charity/NGO';
import Misc from './Misc.jsx';
import GiftAidForm from './GiftAidForm.jsx';

import { donate } from './DonationForm-actions';
import { updateField } from './genericActions';


class DonationForm extends React.Component {

	render() {
		const { charity, donationAmount, addGiftAid, donateOK, handleChange, sendDonation } = this.props;

		assert(NGO.isa(charity), charity);

		let project = this.props.project || NGO.getProject(charity);
		assert(project, charity);

		const donationParams = {
			charityId: charity['@id'],
			currency: 'GBP',
			giftAid: addGiftAid,
			total100: donationAmount,
		};

		let impacts = NGO.getImpacts(project);
		if ( ! impacts) {
			impacts = [{price:'5'}, {
				price: 10,
				// number: , NA
				// output: '', NA
			}];
		}

		// donated?
		if (false) {
			return (<ThankYouAndShare />);
		}

		const donateButton = donateOK ? (
			<DonationFormButton
				amount={donationAmount}
				onToken={(stripeResponse) => { sendDonation(donationParams, stripeResponse); }}
			/>
		) : (
			<Button disabled>Donate</Button>
		);

		return (<div className='DonationForm'>
			<DonationAmounts impacts={impacts} charity={charity} project={project} />
			<GiftAidForm {...this.props} handleChange={handleChange} />
			<p>{ `OK to donate: ${donateOK}` }</p>

			<ThankYouAndShare />
		</div>);
	}
}


class ThankYouAndShare extends React.Component {

	constructor(...params) {
		super(...params);
		this.state = {
			shareText: 'SoGive thanks $name for funding $charity to $impact'
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
		return (<div className='ThankYouAndShare'>
			<h3>Thank you for donating!</h3>

			<p>Share this on social media? On average this leads to 2-3 times more donations.</p>

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
		<StripeCheckout name="SoGive" description="See the impact of your charity donations"
			image="http://local.sogive.org/img/SoGive-Light-70px.png"
			email={email}
			panelLabel="Donate"
			amount={amount}
			currency="GBP"
			stripeKey="pk_test_RyG0ezFZmvNSP5CWjpl5JQnd"
			bitcoin
			allowRememberMe
			token={onToken}
		>
			<button className="btn btn-primary">Donate</button>
		</StripeCheckout>
	);
};


const DonationAmounts = ({charity, project, impacts}) => {
	let damounts = _.map(impacts, a => (<DonationAmount key={"donate_"+a.price} charity={charity} project={project} impact={a}/>) );
	return(
		<div>
			<ul>{damounts}</ul>
			<FormControl
				type="text"
				placeholder="Enter donation amount"
				onChange={({ value }) => { updateField('donationAmount', value); }}
			/>
		</div>
	);
};

const DonationAmount = function({charity, project, impact}) {
	return <li>£{impact.price} will fund {impact.number} {impact.output}</li>;
};


const DonationList = ({donations}) => {
	let ddivs = _.map(donations, d => <li key={uid()}>{d}</li>);
	return <ul>{ddivs}</ul>;
};

const mapStateToProps = (state, ownProps) => ({
	...ownProps,
	...state.donationForm,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	handleChange: (field, value) => dispatch(updateField('DONATION_FORM_UPDATE', field, value)),
	sendDonation: (charityId, stripeResponse, amount) => dispatch(donate(dispatch, charityId, stripeResponse, amount)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DonationForm);
