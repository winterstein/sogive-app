// @Flow
import React, { Component } from 'react';
import _ from 'lodash';
import { assert } from 'sjtest';
import Login from 'you-again';
import {XId } from 'wwutils';
import { Tabs, Tab, Modal, Button } from 'react-bootstrap';

import { StripeProvider, Elements, injectStripe, CardElement, CardNumberElement, CardExpiryElement, CardCVCElement, 
	PostalCodeElement, PaymentRequestButtonElement } from 'react-stripe-elements';

import C from '../C';
import printer from '../utils/printer';
import ActionMan from '../plumbing/ActionMan';
import DataStore from '../plumbing/DataStore';
import NGO from '../data/charity/NGO';
import FundRaiser from '../data/charity/FundRaiser';
import Donation from '../data/charity/Donation';
import MonetaryAmount from '../data/charity/MonetaryAmount';

import Misc from './Misc';
import {nonce,getType} from '../data/DataClass';

// falsy value for SERVER_TYPE = production
const stripeKey = (C.SERVER_TYPE) ?
	'pk_test_RyG0ezFZmvNSP5CWjpl5JQnd' // test
	: 'pk_live_InKkluBNjhUO4XN1QAkCPEGY'; // live

/**
 * onToken: {!Function} on success?? What are the inputs?? maybe link to Stripe doc??
 */
const PaymentWidget = ({amount, onToken, recipient}) => {
	MonetaryAmount.assIsa(amount);
	return (
		<div className='section donation-amount'>
			<div className='well'>
				??test card details, to make testing easy
				<button onClick={e => onToken()}>pretend I paid</button>
			</div>
			<StripeProvider apiKey={stripeKey}>
				<Elements>
					<StripeThings onToken={onToken} amount={amount} recipient={recipient} />
				</Elements>
			</StripeProvider>
		</div>
	);
};

/**
 * Stripe widgets manage their own state
 */	
class StripeThingsClass extends Component {
	constructor(props) {
		super(props);

		const {amount, onToken, recipient, email} = props;

		/* We might be able to forgo the rigmarole of collecting
		+ submitting CC data ourselves, if the browser supports
		the generic Payments API or has Google Wallet / Apple Pay
		integration. Stripe gives us a pre-rolled button which
		extracts a Stripe payment token from these services.
		Here, we check if it's available - in render(), if it is,
		we skip showing the form and just present a flashy "Pay"
		button. */
		
		const paymentRequest = props.stripe.paymentRequest({
			country: 'GB',
			currency: (amount.currency || 'gbp').toLowerCase(),
			total: {
				label: `Payment to ${recipient}`,
				amount: amount.value*100, // uses pence
			},
		});

		paymentRequest.on('token', ({complete, token, ...data}) => {
			console.log('paymentRequest received Stripe token: ', token);
			console.log('paymentRequest received customer information: ', data);
			onToken({token, ...data});
			complete('success');
		});

		paymentRequest.canMakePayment().then(result => {
			this.setState({canMakePayment: !!result});
		});
 
		this.state = {
			canMakePayment: false,
			paymentRequest,			
			email
		};
	} // ./constructor

	handleSubmit(event) {
		console.log("PaymentWidget - handleSubmit", event);
		// Don't submit and cause a pageload!
		event.preventDefault();

		// Within the context of `Elements`, this call to createToken knows which Element to
		// tokenize, since there's only one in this group.
		let tokenInfo = {
			name: this.props.username,
			email: this.state.email
		};
		this.props.stripe.createToken(tokenInfo).then(({token, ...data}) => this.props.onToken({token, ...data}));
	
		// However, this line of code will do the same thing:
		// this.props.stripe.createToken({type: 'card', name: 'Jenny Rosen'});

		// end copy-pasted code
		
		/* here's what we do with the token when we have it in the old donation widget! */
		/*onToken={(stripeResponse) => { ActionMan.donate({ charity, formPath, formData, stripeResponse }); } }*/
	}

	render() {
		if (this.state.canMakePayment) {
			return (<PaymentRequestButtonElement paymentRequest={this.state.paymentRequest} />);
		}

		const {amount, recipient} = this.props;
		// TODO an email editor if this.props.email is unset
		// @Roscoe -- Why do we want postcode here?? ^Dan
		return (
			<form onSubmit={(event) => this.handleSubmit(event)}>
				<h3>Payment of <Misc.Money amount={amount} /> to {recipient}</h3>
				<div className='form-group'>
					<label>Card number</label>
					<div className='form-control'>
						<CardNumberElement placeholder='0000 0000 0000 0000' />
					</div>
				</div>
				<div className='form-group'>
					<label>Expiry date</label>
					<div className='form-control'>
						<CardExpiryElement />
					</div>
				</div>
				<div className='form-group'>
					<label>CVC</label>
					<div className='form-control'>
						<CardCVCElement />
					</div>
				</div>
				<div className='form-group'>
					<label>Postcode</label>
					<div className='form-control'>
						<PostalCodeElement placeholder='AB1 2CD' />
					</div>
				</div>
				<Button type='submit'>Submit Payment</Button>
			</form>
		);
	} // ./render()
} // ./StripeThingsClass

const StripeThings = injectStripe(StripeThingsClass);

export default PaymentWidget;
