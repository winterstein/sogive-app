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
import Transfer from '../data/Transfer';
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
		<button className='btn btn-lg btn-primary' onClick={() => DataStore.setValue([...widgetPath, 'open'], true)}>
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
	const stage = Number.parseInt(DataStore.getUrlValue('dntnStage'));

	// not open? just show the button
	let isOpen = DataStore.getValue([...widgetPath, 'open']);
	// THERE IS DEFINITELY A BETTER WAY OF CHECKING THIS. I JUST HAD TO ADD ISNAN TO THE LIST OF "THINGS STAGE SHOULD NOT BE" RIGHT BEFORE A DEMO.
	if (isOpen===undefined || isOpen===null) {
		isOpen = stage!==undefined && stage!==null && !isNaN(stage);
	}
	if ( ! isOpen) {
		return null;
	}

	const closeLightbox = () => DataStore.setValue([...widgetPath, 'open'], false);

	// get/make the draft donation
	let type = C.TYPES.Donation;
	let pDonation = ActionMan.getDonationDraft({item});
	// if the promise is running, wait for it before making a new draft
	if ( ! pDonation.resolved) {
		return (
			<Modal show className="donate-modal" onHide={closeLightbox}>
				<Modal.Body>
					<Misc.Loading />
				</Modal.Body>
			</Modal>
		);
	}

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

	// TODO Thank You / confirmation / receipt page
	// TODO if NGO.isa(item) => no message section
	// Minor TODO if no gift-aid => no details section

	// your page?
	let myPage = Login.getId() === item.oxid;
	if ( ! myPage) {
		Login.checkShare(getId(item));
	}

	// Don't ask for gift-aid details if the charity doesn't support it
	// const showGiftAidSection = 
	// We don't need to collect address etc. if we're not collecting gift-aid
	const showDetailsSection = true; // hm - the UX flow is a bit odd with this popping in. DataStore.getValue(path.concat('giftAid'));
	// You don't send messages to charities...
	const showMessageSection = FundRaiser.isa(item);

	const stages = [
		<AmountSection path={path} />,
		<GiftAidSection path={path} />,
	];
	const navStages = [
		{title:'Amount'},
		{title:'Gift Aid'},
	];

	if (showDetailsSection) {
		stages.push(<DetailsSection path={path} />);
		navStages.push({title:'Details'},);
	}
	if (showMessageSection) {
		stages.push(<MessageSection path={path} item={item} />);
		navStages.push({title:'Message'},);
	}
	stages.push(<PaymentSection path={path} donation={donationDraft} item={item} />);
	stages.push(<ThankYouSection path={path} item={item} />);
	navStages.push({title:'Payment'},);
	navStages.push( {title:'Confirmation'});

	const wizardStages = stages.map((section, i) => (
		<WizardStage key={i} stageKey={i} stageNum={stage}>
			{section}
		</WizardStage>
	));	

	// don't offer a next button for payment
	const maxStage = stages.length - 2; 

	return (
		<Modal show className="donate-modal" onHide={closeLightbox}>
			<Modal.Header closeButton >
				<Modal.Title>Donate to {causeName}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<WizardProgressWidget stageNum={stage} 
					stagePath={stagePath} 
					stages={navStages}
				/>
				{wizardStages}
			</Modal.Body>
			<Modal.Footer>
				<PrevButton stagePath={stagePath} /> <NextButton maxStage={maxStage} stagePath={stagePath} />
			</Modal.Footer>
			<Misc.SavePublishDiscard type={type} id={donationDraft.id} hidden />
		</Modal>
	);
}; // ./DonationForm


const AmountSection = ({path}) => {
	let credit = Transfer.getCredit();
	let dflt = credit || MonetaryAmount.make({value:10});
	return (
		<div className='section donation-amount'>
			<Misc.PropControl prop='amount' path={path} type='MonetaryAmount' label='Donation' dflt={dflt} />
			{credit? <p><i>You have <Misc.Money amount={credit} /> in credit.</i></p> : null}
		</div>);
};

const GiftAidSection = ({path, charity}) => {
	const ownMoney = DataStore.getValue(path.concat('giftAidOwnMoney'));
	const fromSale = DataStore.getValue(path.concat('giftAidFundRaisedBySale'));
	const benefit = DataStore.getValue(path.concat('giftAidBenefitInReturn'));
	const taxpayer = DataStore.getValue(path.concat('giftAidTaxpayer'));
	const canGiftAid = ownMoney && taxpayer && ! (fromSale || benefit);
	
	// If we're disabling the checkbox, untick it too
	if ( ! canGiftAid) {
		DataStore.setValue(path.concat('giftAid'), false, false);
	}

	return (
		<div className='section donation-amount'>
			<img src='/img/giftaid-it-logo.gif' alt='Gift Aid It' />
			<p>
				GiftAid can add considerably to your donation at no extra cost. 
				Please answer the questions below to see if this donation qualifies for GiftAid.
			</p>
			<Misc.PropControl prop='giftAidOwnMoney' 
				label={`This donation is my own money. It has not come from anyone else e.g. a business, friends, or a collection.`} path={path} type='yesNo' />
			<Misc.PropControl prop='giftAidFundRaisedBySale' 
				label={`This is the proceeds from the sale of goods or provision of service e.g. a cake sale, auction or car wash.`} path={path} type='yesNo' />
			<Misc.PropControl prop='giftAidBenefitInReturn' label={`I am receiving a benefit from this donation e.g. entry to an event, raffle or sweepstake.`} 
				path={path} type='yesNo' />
			<Misc.PropControl prop='giftAidTaxpayer'
				label={`I am a UK taxpayer.`}
				path={path} type='yesNo' />
			<p>If you pay less Income Tax and/or Capital Gains Tax in the current tax year 
				than the amount of Gift Aid claimed on all your donations, it is your responsibility to pay any difference</p>
			<Misc.PropControl prop='giftAid' path={path} type='checkbox' label='I want to Gift Aid this donation' disabled={ ! canGiftAid} />
		</div>
	);
};

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


const PaymentSection = ({path, item}) => {
	const donation = DataStore.getValue(path);
	const {amount} = donation;

	const onToken = (token) => {
		donation.stripe = token;
		DataStore.setData(donation);
		
		ActionMan.publishEdits(C.TYPES.Donation, donation.id, donation)
			.then(() => {
				const stagePath = ['location', 'params', 'dntnStage'];
				const stage = Number.parseInt(DataStore.getValue(stagePath));
				DataStore.setValue(stagePath, Number.parseInt(stage) + 1);
			});
	};

	return <PaymentWidget onToken={onToken} amount={amount} recipient={item.name} />;
};

const ThankYouSection = ({path, item}) => {
	const donation = DataStore.getValue(path);

	return (
		<div className='text-center'>
			<h3>Thank You!</h3>
			<big>
				<p>
					We've received your donation of <Misc.Money amount={donation.amount} /> to {item.name}.<br />
					A receipt for your donation will be emailed to {Login.getEmail()}.
				</p>
				<p>
					Thanks for using SoGive!
				</p>
			</big>
		</div>
	); // TODO
};

export {DonateButton};
export default DonationForm;
