// @Flow
import React, { Component } from 'react';
import { Button, Form, FormGroup, Col } from 'react-bootstrap';

import { StripeProvider, Elements, injectStripe,
	CardNumberElement, CardExpiryElement, CardCVCElement, 
	PaymentRequestButtonElement } from 'react-stripe-elements';

import C from '../C';
import Money from '../data/charity/Money';
import Transfer from '../data/Transfer';
import {assMatch} from 'sjtest';
import Misc from './Misc';

// falsy value for SERVER_TYPE = production
const stripeKey = (C.SERVER_TYPE) ?
	'pk_test_RyG0ezFZmvNSP5CWjpl5JQnd' // test
	: 'pk_live_InKkluBNjhUO4XN1QAkCPEGY'; // live

const SKIP_TOKEN = {
	id: 'skip_token',
	type: 'card',
};
const CREDIT_TOKEN = {
	id: 'credit_token',
	type: 'credit',
};

/**
 * amount: {?Money} if null, return null
 * recipient: {!String}
 * onToken: {!Function} inputs: {id:String, type:String, token:String, email:String}
 * 	Called once the user has provided payment details, and we've got a token back from Stripe. 
 * 	This should then call the server e.g. by publishing a donation - to take the actual payment.
 * 	The token string is either a Stripe authorisation token, or one of the fixed special values (e.g. credit_token).
 * 	
 */
const PaymentWidget = ({amount, onToken, recipient, email}) => {
	if ( ! amount) {
		return null; // no amount, no payment
	}
	Money.assIsa(amount);
	assMatch(onToken, Function);
	assMatch(recipient, String);

	// Invoke the callback, with a minimal fake token that the servlet will catch
	const skipAction = (event) => (
		onToken({
			...SKIP_TOKEN,
			email,
		})
	);
	const payByCredit = (event) => (
		onToken({
			...CREDIT_TOKEN,
			email,
		})
	);

	// pay on credit??
	let credit = Transfer.getCredit();
	if (credit && Money.value(credit) > 0) {
		if (Money.value(credit) > Money.value(amount)) {
			return (
				<div className='section donation-amount'>			
					<p>You have <Misc.Money amount={credit} /> in credit which will pay for this.</p>
					<button onClick={payByCredit} className='btn btn-primary'>Send Payment</button>
				</div>
			);					
		}
	} // ./credit

	
	return (
		<div className='section donation-amount'>			
			<StripeProvider apiKey={stripeKey}>
				<Elements>
					<StripeThings onToken={onToken} amount={amount} credit={credit} recipient={recipient} email={email} />
				</Elements>
			</StripeProvider>
			{ ! C.isProduction() ? (
				<small className='clear'>
					Test card no: 4000008260000000 (use any CVC and any future expiry date). Or
					{' '}
					<button onClick={skipAction}>test: pretend I paid</button>
				</small>
			) : null}
		</div>
	);
};

/**
 * Stripe widgets manage their own state
 */	
class StripeThingsClass extends Component {
	constructor(props) {
		super(props);

		const {amount, credit, onToken, recipient, email} = props;

		let residual = amount;
		if (credit) {
			residual = Money.sub(amount, credit);		
		}

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
				amount: residual.value*100, // uses pence
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
		this.props.stripe.createToken(tokenInfo).then(({token, ...data}) => this.props.onToken(token));
	
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

		const {amount, recipient, credit} = this.props;
		// TODO an email editor if this.props.email is unset
		return (
			<Form horizontal onSubmit={(event) => this.handleSubmit(event)}>
				<h3>Payment of <Misc.Money amount={amount} /> to {recipient}</h3>
				{credit && Money.value(credit) > 0? 
					<FormGroup><Col md={12}>
						You have <Misc.Money amount={credit} /> in credit which will be used towards this payment.
					</Col></FormGroup>
				: null}
				<FormGroup>
					<Col md={12}>
						<label>Card number</label>
						<div className='form-control'>
							<CardNumberElement placeholder='0000 0000 0000 0000' />
						</div>
					</Col>
				</FormGroup>
				<FormGroup>
					<Col md={6}>
						<label>Expiry date</label>
						<div className='form-control'>
							<CardExpiryElement />
						</div>
					</Col>
					<Col md={6}>
						<label>CVC</label>
						<div className='form-control'>
							<CardCVCElement />
						</div>
					</Col>
				</FormGroup>
				<button className='btn btn-primary btn-lg pull-right' type='submit'>Submit Payment</button>
			</Form>
		);
	} // ./render()
} // ./StripeThingsClass

const StripeThings = injectStripe(StripeThingsClass);

export {SKIP_TOKEN};
export default PaymentWidget;
