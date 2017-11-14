// @Flow
import React, { Component } from 'react';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import Login from 'you-again';
import {XId } from 'wwutils';
import { Modal } from 'react-bootstrap';

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
import {nonce, getId, getType} from '../data/DataClass';
import PaymentWidget from './PaymentWidget';
import WizardProgressWidget, {WizardStage, NextButton, PrevButton} from './WizardProgressWidget';

/**
 * 
 * TODO Doc notes on the inputs to this. the charity profile sends in charity and project.
 */

// falsy value for SERVER_TYPE = production
const stripeKey = (C.SERVER_TYPE) ?
	'pk_test_RyG0ezFZmvNSP5CWjpl5JQnd' // test
	: 'pk_live_InKkluBNjhUO4XN1QAkCPEGY'; // live

/**
 * NB: We can have several DonateButtons, but only one model form
 */
const DonateButton = ({item}) => {
	assert(item && getId(item), "NewDonationForm.js - DonateButton: no item "+item);
	const widgetPath = ['widget', 'NewDonationForm', getId(item)];
	return (
		<button className='btn btn-default' onClick={() => DataStore.setValue([...widgetPath, 'open'], true)}>
			Donate
		</button>
	);
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

/**
 * item: a FundRaiser or NGO
 */
const DonationForm = ({item, charity, causeName}) => {
	const id = getId(item);
	assert(id, "DonationForm", item);
	assert(NGO.isa(item) || FundRaiser.isa(item) || Basket.isa(item), item);	
	if ( ! causeName) causeName = item.displayName || item.name || id;

	if ( ! charity) {
		if (NGO.isa(item)) charity = item;
		// TODO get charity from FundRaiser
	}
	let charityId = charity? getId(charity) : item.charityId;
	/*
	// Restore once we resolve this issue where Things keep losing their types
	assert(C.TYPES.isFundRaiser(getType(item)) || C.TYPES.isNGO(getType(item)) || C.TYPES.isEvent(getType(item)), 
		"NewDonationForm - type "+getType(item));
	*/
	const widgetPath = ['widget', 'NewDonationForm', id];

	// what stage?
	const stagePath = ['location', 'params', 'dntnStage'];
	const stage = DataStore.getUrlValue('dntnStage');

	// not open? just show the button
	let isOpen = DataStore.getValue([...widgetPath, 'open']);
	if (isOpen===undefined || isOpen===null) {
		isOpen = stage!==undefined && stage!==null;
	}
	if ( ! isOpen) {
		return null;
	}

	// get/make the draft donation
	let type = C.TYPES.Donation;
	let pDonation = ActionMan.getDonationDraft({item});
	// if the promise is running, wait for it before making a new draft
	if ( ! pDonation.resolved) {
		return <Misc.Loading />;
	}
	console.log('*** pDonation resolved, creating donation draft');

	let donationDraft = pDonation.value;
	if ( ! donationDraft) {
		// make a new draft donation
		donationDraft = Donation.make({			
			to: charityId,
			fundRaiser: FundRaiser.isa(item)? getId(item) : null,
			via: FundRaiser.isa(item)? FundRaiser.oxid(item) : null,
			from: Login.isLoggedIn()? Login.getId() : null,
			amount: MonetaryAmount.make({ value: 10, currency: 'gbp' }),
			coverCosts: true,		
		});
	}	

	const path = ['data', type, donationDraft.id];
	DataStore.setValue(path, donationDraft, false);
	// also store it where the fetch will find it
	DataStore.setValue(['data', type, 'draft-to:'+donationDraft.to], donationDraft, false);
	

	const closeLightbox = () => DataStore.setValue([...widgetPath, 'open'], false);

	// TODO replace tabs with WizardProgressWidget (see RegisterPage)
	// TODO Thank You / confirmation / receipt page
	// TODO if NGO.isa(item) => no message section
	// Minor TODO if no gift-aid => no details section

	// your page?
	let myPage = Login.getId() === item.oxid;
	if ( ! myPage) {
		Login.checkShare(item);
	}

	return (
		<Modal show className="donate-modal" onHide={closeLightbox}>
			<Modal.Header closeButton >
				<Modal.Title>Donate to {causeName}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<WizardProgressWidget stageNum={stage} 
					stagePath={stagePath} 
					stages={[{title:'Amount'}, {title:'Gift Aid'}, {title:'Details'}, {title:'Message'}, {title:'Payment'}, {title:'Confirmation'}]}
				/>
				<WizardStage stageKey={0} stageNum={stage}>
					<AmountSection path={path} />
				</WizardStage>
				<WizardStage stageKey={1} stageNum={stage}>
					<GiftAidSection path={path} />
				</WizardStage>
				<WizardStage stageKey={2} stageNum={stage}>
					<DetailsSection path={path} />
				</WizardStage>
				<WizardStage stageKey={3} stageNum={stage}>
					<MessageSection path={path} item={item} />
				</WizardStage>
				<WizardStage stageKey={4} stageNum={stage}>
					<PaymentSection path={path} />
				</WizardStage>
				<WizardStage stageKey={5} stageNum={stage}>
					<ThankYouSection path={path} />
				</WizardStage>
			</Modal.Body>
			<Modal.Footer>
				<PrevButton stagePath={stagePath} /> <NextButton maxStage={5} stagePath={stagePath} />
			</Modal.Footer>
			<Misc.SavePublishDiscard type={type} id={donationDraft.id} hidden />
		</Modal>
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
		<Misc.PropControl prop='donorName' label='Name' placeholder='Enter your name' path={path} type='text' dflt={Login.getUser() && Login.getUser().name} />
		<Misc.PropControl prop='donorEmail' label='Email' placeholder='Enter your address' path={path} type='email' dflt={Login.getEmail()} />
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

export {DonateButton};
export default DonationForm;
