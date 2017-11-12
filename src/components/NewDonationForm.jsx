// @Flow
import React, { Component } from 'react';
import _ from 'lodash';
import { assert } from 'sjtest';
import Login from 'you-again';
import {XId } from 'wwutils';
import { Tabs, Tab, Modal, Button } from 'react-bootstrap';

import { StripeProvider, Elements, injectStripe, CardElement, CardNumberElement, CardExpiryElement, CardCVCElement, PostalCodeElement, PaymentRequestButtonElement } from 'react-stripe-elements';

import C from '../C';
import printer from '../utils/printer';
import ActionMan from '../plumbing/ActionMan';
import DataStore from '../plumbing/DataStore';
import NGO from '../data/charity/NGO';
import FundRaiser from '../data/charity/FundRaiser';
import Donation from '../data/charity/Donation';
import MonetaryAmount from '../data/charity/MonetaryAmount';
import Basket from '../data/Basket';

import Misc from './Misc';
import {nonce,getType} from '../data/DataClass';
import PaymentWidget from './PaymentWidget';

/**
 * 
 * TODO Doc notes on the inputs to this. the charity profile sends in charity and project.
 */

// falsy value for SERVER_TYPE = production
const stripeKey = (C.SERVER_TYPE) ?
	'pk_test_RyG0ezFZmvNSP5CWjpl5JQnd' // test
	: 'pk_live_InKkluBNjhUO4XN1QAkCPEGY'; // live


const initialFormData = Donation.make({
	id: nonce(),
	from: Login.getId(),
	amount: MonetaryAmount.make({ value: 10, currency: 'gbp' }),
	coverCosts: true,
	giftAid: false,
	giftAidTaxpayer: false,
	giftAidOwnMoney: false,
	giftAidNoCompensation: false,
	donorName: '',
	donorAddress: '',
	donorPostcode: '',
	message: '',
	pending: false,
	complete: false,
});

const initialWidgetState = {
	open: false,
	stage: 1,
};

/** no donations below a min £1 */
const amountOK = ({amount}) => amount && amount.value >= 1.0;

const giftAidOK = ({giftAid, giftAidTaxpayer, giftAidOwnMoney, giftAidNoCompensation}) => (
	!giftAid || (giftAidTaxpayer && giftAidOwnMoney && giftAidNoCompensation)
);

/** 
 * Minor todo: address & postcode can be optional, unless you have gift aid
*/
const detailsOK = ({name, address, postcode}) => (
	name.trim().length > 0 && address.trim().length > 0 && postcode.trim().length > 0
);

// Message can't be "bad", payment is final stage so can only be incomplete
const messageOK = (formData) => true;

const paymentOK = (formData) => true;

const stagesOK = (formData) => [
	amountOK(formData),
	giftAidOK(formData),
	detailsOK(formData),
	messageOK(formData),
	paymentOK(formData),
];


/**
 * item: a FundRaiser or NGO
 */
const DonationForm = ({item}) => {
	assert(item.id, "DonationForm", item);
	assert(NGO.isa(item) || FundRaiser.isa(item) || Basket.isa(item), item);
	/*
	// Restore once we resolve this issue where Things keep losing their types
	assert(C.TYPES.isFundRaiser(getType(item)) || C.TYPES.isNGO(getType(item)) || C.TYPES.isEvent(getType(item)), 
		"NewDonationForm - type "+getType(item));
	*/
	const widgetPath = ['widget', 'NewDonationForm', item.id];
	let widgetState = DataStore.getValue(widgetPath);
	if (!widgetState) {
		widgetState = initialWidgetState;
		DataStore.setValue(widgetPath, widgetState, false);
	}
	const donateButton = (
		<button className='btn btn-default' onClick={() => DataStore.setValue([...widgetPath, 'open'], true)}>
			Donate
		</button>
	);

	// get/make the draft donation
	let type = C.TYPES.Donation;
	let pDonation = ActionMan.getDonationDraft({item});
	let donationDraft = pDonation.value;
	if ( ! donationDraft) {
		// if the promise is running, wait for it before making a new draft
		if ( ! pDonation.resolved) {
			return donateButton;
			// TODO if they click whilst the promise is running (unlikely)
			// display a spinner
		}
		// make a new draft donation
		donationDraft = {
			...initialFormData,
			to: item.id,
			// TODO via and fundRaiser
		};
	}

	// not open? just show the button
	if (!widgetState.open) {
		return donateButton;
	}

	const path = ['data', type, donationDraft.id];
	DataStore.setValue(path, donationDraft, false);
	// also store it where the fetch will find it
	DataStore.setValue(['data', type, 'draft-to:'+donationDraft.to], donationDraft, false);
	
	const stagePath = [...widgetPath, 'stage'];

	const closeLightbox = () => DataStore.setValue([...widgetPath, 'open'], false);

	const { stage } = widgetState;
	const isFirst = stage <= 1;
	const isLast = stage >= 5;
	
	const prevLink = isFirst ? '' : (
		<Misc.SetButton path={stagePath} value={stage - 1} className='btn btn-default pull-left'>
			Previous
		</Misc.SetButton>
	);
	const nextLink = isLast ? '' : (
		<Misc.SetButton path={stagePath} value={stage + 1} className='btn btn-default pull-right'>
			Next
		</Misc.SetButton>
	);

	// TODO replace tabs with WizardProgressWidget (see RegisterPage)
	// TODO Thank You / confirmation / receipt page
	// TODO if NGO.isa(item) => no message section
	// Minor TODO if no gift-aid => no details section

	return (
		<div>
			{donateButton}
			<Modal show={widgetState.open} className="donate-modal" onHide={closeLightbox}>
				<Modal.Header closeButton >
					<Modal.Title>GIMME YOUR MONEY</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Tabs activeKey={stage} onSelect={(key) => DataStore.setValue(stagePath, key)} id='payment-stages'>
						<Tab eventKey={1} title='Amount'>
							<AmountSection path={path} />
						</Tab>
						<Tab eventKey={2} title='Gift Aid'>
							<GiftAidSection path={path} />
						</Tab>
						<Tab eventKey={3} title='Details'>
							<DetailsSection path={path} />
						</Tab>
						<Tab eventKey={4} title='Message'>
							<MessageSection path={path} item={item} />
						</Tab>
						<Tab eventKey={5} title='Payment'>
							<PaymentSection path={path} />
						</Tab>
						<Tab eventKey={5} title='Confirmation'>
							<ThankYouSection path={path} />
						</Tab>
					</Tabs>
				</Modal.Body>
				<Modal.Footer>
					{prevLink} {nextLink}
				</Modal.Footer>
				<Misc.SavePublishDiscard type={type} id={donationDraft.id} hidden />
			</Modal>
		</div>
	);
}; // ./DonationForm


const AmountSection = ({path}) => (
	// TODO replace coverCosts checkbox with a slider for optional donation to cover our costs
	<div className='section donation-amount'>
		<Misc.PropControl prop='amount' path={path} type='MonetaryAmount' label='Donation' />
		<Misc.PropControl prop='coverCosts' path={path} type='checkbox' label='Cover processing costs' />
	</div>
);

const GiftAidSection = ({path}) => (
	<div className='section donation-amount'>
		<Misc.PropControl prop='giftAid' path={path} type='checkbox' label='Add Gift Aid' />
		<Misc.PropControl prop='giftAidTaxpayer' label={`I'm a taxpayer`} path={path} type='checkbox' />
		<Misc.PropControl prop='giftAidOwnMoney' label={`This is my money`} path={path} type='checkbox' />
		<Misc.PropControl prop='giftAidNoCompensation' label={`Nobody's paying me to do this`} path={path} type='checkbox' />
	</div>
);

const DetailsSection = ({path}) => (
	// TODO do we have the user's details stored?
	<div className='section donation-amount'>
		<Misc.PropControl prop='donorName' label='Name' placeholder='Enter your name' path={path} type='text' />
		<Misc.PropControl prop='donorAddress' label='Address' placeholder='Enter your address' path={path} type='address' />
		<Misc.PropControl prop='donorPostcode' label='Postcode' placeholder='Enter your postcode' path={path} type='postcode' />
	</div>
);

const MessageSection = ({path, item}) => (
	<div className='section donation-amount'>
		<Misc.PropControl prop='message' label='Message' placeholder={`Do you have a message for ${item.owner.name}?`} path={path} type='textarea' />
	</div>
);

const PaymentSection = ({path}) => {
	return <PaymentWidget />;
};

const ThankYouSection = () => {
	return <div>Thank You!</div>; // TODO
};

export default DonationForm;
