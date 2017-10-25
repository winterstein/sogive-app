// @Flow
import React, { Component } from 'react';
import _ from 'lodash';
import { assert } from 'sjtest';
import Login from 'you-again';
import StripeCheckout from 'react-stripe-checkout';
import { uid, XId } from 'wwutils';
import { Button, FormControl, InputGroup, Tabs, Tab } from 'react-bootstrap';

import { StripeProvider, Elements, injectStripe, CardElement, CardNumberElement, CardExpiryElement, CardCVCElement, PostalCodeElement, PaymentRequestButtonElement } from 'react-stripe-elements';

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

const stripeKey = (window.location.host.startsWith('test') || window.location.host.startsWith('local')) ?
		'pk_test_RyG0ezFZmvNSP5CWjpl5JQnd' // test
		: 'pk_live_InKkluBNjhUO4XN1QAkCPEGY'; // live


const initialFormData = {
	amount: MonetaryAmount.make({ value: 10, currency: 'gbp' }),
	coverCosts: true,
	giftAid: false,
	giftAidTaxpayer: false,
	giftAidOwnMoney: false,
	giftAidNoCompensation: false,
	name: '',
	address: '',
	postcode: '',
	message: '',
	pending: false,
	complete: false,
	currentStage: 1,
};

const amountOK = ({amount}) => amount && amount.value >= 1.0;

const giftAidOK = ({giftAid, giftAidTaxpayer, giftAidOwnMoney, giftAidNoCompensation}) => (
	!giftAid || (giftAidTaxpayer && giftAidOwnMoney && giftAidNoCompensation)
);

const detailsOK = ({name, address, postcode}) => (
	name.trim().length > 0 && address.trim().length > 0 && postcode.trim().length > 0
);

const messageOK = (formData) => true;

const paymentOK = (formData) => true;

const stagesOK = (formData) => [
	amountOK(formData),
	giftAidOK(formData),
	detailsOK(formData),
	messageOK(formData),
	paymentOK(formData), // Payment can't be "bad"
];


const DonationForm = ({item}) => {

	let type = C.TYPES.Donation;
	let pDonation = ActionMan.getDonationDraft({to: item.id});
	if ( ! pDonation.value) {
		return <Misc.Loading />;
	}

	const formPath = ['widget', 'NewDonationForm', 'fart'];
	let formValues = DataStore.getValue(formPath);
	if (!formValues) {
		DataStore.setValue(formPath, initialFormData, false);
		formValues = DataStore.getValue(formPath);
	}

	const stagePath = [...formPath, 'currentStage'];



	return (
		<div className='lightbox'>
			<Misc.Card title='GIMME YOUR MONEY'>
				<Tabs activeKey={formValues.currentStage} onSelect={(key) => DataStore.setValue(stagePath, key)} id='payment-stages'>
					<Tab eventKey={1} title='Amount'>
						<SectionWrapper stagePath={stagePath} sectionNumber={1} isFirst>
							<AmountSection formPath={formPath} />
						</SectionWrapper>
					</Tab>
					<Tab eventKey={2} title='Gift Aid'>
						<SectionWrapper stagePath={stagePath} sectionNumber={2}>
							<GiftAidSection formPath={formPath} />
						</SectionWrapper>
					</Tab>
					<Tab eventKey={3} title='Details'>
						<SectionWrapper stagePath={stagePath} sectionNumber={3}>
							<DetailsSection formPath={formPath} />
						</SectionWrapper>
					</Tab>
					<Tab eventKey={4} title='Message'>
						<SectionWrapper stagePath={stagePath} sectionNumber={4}>
							<MessageSection formPath={formPath} />
						</SectionWrapper>
					</Tab>
					<Tab eventKey={5} title='Payment'>
						<SectionWrapper stagePath={stagePath} sectionNumber={5} isLast>
							<PaymentSection formPath={formPath} />
						</SectionWrapper>
					</Tab>
				</Tabs>
			</Misc.Card>
		</div>
	);
}; // ./DonationForm

const SectionWrapper = ({stagePath, sectionNumber, children, isFirst, isLast}) => {
	const prevLink = isFirst ? '' : <Misc.SetButton path={stagePath} value={sectionNumber - 1}>Previous</Misc.SetButton>;
	const nextLink = isLast ? '' : <Misc.SetButton path={stagePath} value={sectionNumber + 1}>Next</Misc.SetButton>;
	return (
		<div className='section'>
			{ children }
			{ prevLink } { nextLink }
		</div>
	);
};


const AmountSection = ({formPath}) => (
	<div className='section donation-amount'>
		<Misc.PropControl prop='amount' path={formPath} type='MonetaryAmount' label='Donation' />
		<Misc.PropControl prop='coverCosts' path={formPath} type='checkbox' label='Cover processing costs' />
	</div>
);

const GiftAidSection = ({formPath}) => (
	<div className='section donation-amount'>
		<Misc.PropControl prop='giftAid' path={formPath} type='checkbox' label='Add Gift Aid' />
		<Misc.PropControl prop='giftAidTaxpayer' label={`I'm a taxpayer`} path={formPath} type='checkbox' />
		<Misc.PropControl prop='giftAidOwnMoney' label={`This is my money`} path={formPath} type='checkbox' />
		<Misc.PropControl prop='giftAidNoCompensation' label={`Nobody's paying me to do this`} path={formPath} type='checkbox' />
	</div>
);

const DetailsSection = ({formPath}) => (
	<div className='section donation-amount'>
		<Misc.PropControl prop='name' label='Name' placeholder='Enter your name' path={formPath} type='text' />
		<Misc.PropControl prop='address' label='Address' placeholder='Enter your address' path={formPath} type='address' />
		<Misc.PropControl prop='postcode' label='Postcode' placeholder='Enter your postcode' path={formPath} type='postcode' />
	</div>
);

const MessageSection = ({formPath}) => (
	<div className='section donation-amount'>
		<Misc.PropControl prop='message' label='Message' placeholder='Do you have a message for $FUNDRAISER?' path={formPath} type='text' />
	</div>
);

const PaymentSection = ({formPath}) => {
	return (
		<div className='section donation-amount'>
			<StripeProvider apiKey={stripeKey}>
				<Elements>
					<StripeThings />
				</Elements>
			</StripeProvider>
		</div>
	);
};

	
class StripeThingsClass extends Component {
	constructor(props) {
		super(props);

		const paymentRequest = props.stripe.paymentRequest({
			country: 'GB',
			currency: 'gbp',
			total: {
				label: 'Demo total',
				amount: 100,
			},
		});

		paymentRequest.on('token', ({complete, token, ...data}) => {
			console.log('Received Stripe token: ', token);
			console.log('Received customer information: ', data);
			complete('success');
		});

		paymentRequest.canMakePayment().then(result => {
			this.setState({canMakePayment: !!result});
		});
 
		this.state = {
			canMakePayment: false,
			paymentRequest,
		};
	}

	render() {
		return (
			<div>
				<h3>Card number</h3>
				<div className='form-control'>
					<CardNumberElement placeholder='0000 0000 0000 0000' />
				</div>
				<h3>Expiry date</h3>
				<div className='form-control'>
					<CardExpiryElement />
				</div>
				<h3>CVC</h3>
				<div className='form-control'>
					<CardCVCElement />
				</div>
				<h3>Postcode</h3>
				<div className='form-control'>
					<PostalCodeElement placeholder='AB1 2CD' />
				</div>
				<h3>Payment button</h3>
				<div className='form-control'>
					{
						this.state.canMakePayment ? 
							<PaymentRequestButtonElement paymentRequest={this.state.paymentRequest} />
							: `Can't make payment yet`
					}
				</div>
			</div>
		);
	}
}

const StripeThings = injectStripe(StripeThingsClass);

export default DonationForm;
