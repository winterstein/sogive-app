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
import Money from '../data/charity/Money';
import Basket from '../data/Basket';

import Misc from './Misc';
import {nonce, getId, getType} from '../data/DataClass';
import PaymentWidget from './PaymentWidget';
import Wizard, {WizardStage} from './WizardProgressWidget';

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
		else if (FundRaiser.isa(item)) charity = FundRaiser.charity(item);
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
	console.warn('donationDraft',donationDraft);
	if ( ! donationDraft) {
		// make a new draft donation
		donationDraft = Donation.make({
			to: charityId,
			fundRaiser: FundRaiser.isa(item)? getId(item) : null,
			via: FundRaiser.isa(item)? FundRaiser.oxid(item) : null,
			from: Login.isLoggedIn()? Login.getId() : null,
			amount: Money.make({ value: 10, currency: 'gbp' }),
			coverCosts: true,
		});
		console.warn('donationDraft-new', donationDraft);
		const path = ['data', type, donationDraft.id];
		// store in data
		DataStore.setValue(path, donationDraft, false);
		// also store it where ActionMan.getDonationDraft will find it
		DataStore.setValue(['data', type, 'draft-to:'+donationDraft.to], donationDraft, false);	
	}
	
	const path = ['data', type, donationDraft.id];
	assert(donationDraft === DataStore.getValue(path), DataStore.getValue(path));
	// Don't ask for gift-aid details if the charity doesn't support it
	const showGiftAidSection = charity && charity[NGO.PROPS.$uk_giftaid()];
	// We don't need to collect address etc. if we're not collecting gift-aid
	const showDetailsSection = true; // hm - the UX flow is a bit odd with this popping in. DataStore.getValue(path.concat('giftAid'));
	// You don't send messages to charities...
	const showMessageSection = FundRaiser.isa(item);

	return (
		<Modal show className="donate-modal" onHide={closeLightbox}>
			<Modal.Header closeButton >
				<Modal.Title>Donate to {causeName}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Wizard stagePath={stagePath} >
					<WizardStage title='Amount' >
						<AmountSection path={path} />
					</WizardStage>
				
					{showGiftAidSection? <WizardStage title='Gift Aid' >
						<GiftAidSection path={path} charity={charity} stagePath={stagePath} />
					</WizardStage> : null}
				
					{showDetailsSection? <WizardStage title='Details'>
						<DetailsSection path={path} stagePath={stagePath} />
					</WizardStage> : null}
				
					{showMessageSection? <WizardStage title='Message'>
						<MessageSection path={path} recipient={item.owner} />
					</WizardStage> : null}
				
					<WizardStage title='Payment' next={false} >
						<PaymentSection path={path} donation={donationDraft} item={item} />
					</WizardStage>
				
					<WizardStage title='Receipt'>
						<ThankYouSection path={path} item={item} />
					</WizardStage>
				</Wizard>
			</Modal.Body>
			<Misc.SavePublishDiscard type={type} id={donationDraft.id} hidden />
		</Modal>
	);
}; // ./DonationForm


const AmountSection = ({path}) => {
	let credit = Transfer.getCredit();	
	const dontn = DataStore.getValue(path);
	console.log("donation", JSON.stringify(dontn));
	const pathAmount = path.concat('amount');
	let val = DataStore.getValue(pathAmount);
	if ( ! val) {
		val = credit || Money.make({value:10});
		DataStore.setValue(pathAmount, val);
	}
	return (
		<div className='section donation-amount'>
			<Misc.PropControl prop='amount' path={path} type='Money' label='Donation' value={val} />
			{Money.value(credit)? <p><i>You have <Misc.Money amount={credit} /> in credit.</i></p> : null}
		</div>);
};

const GiftAidSection = ({path, charity, stagePath, setNavStatus}) => {
	assert(stagePath, "GiftAidSection no stagePath");
	const ownMoney = DataStore.getValue(path.concat('giftAidOwnMoney'));
	const fromSale = DataStore.getValue(path.concat('giftAidFundRaisedBySale'));
	const benefit = DataStore.getValue(path.concat('giftAidBenefitInReturn'));
	const taxpayer = DataStore.getValue(path.concat('giftAidTaxpayer'));
	const yesToGiftAid = DataStore.getValue(path.concat('giftAid'));
			
	const canGiftAid = !! (ownMoney && taxpayer && fromSale===false && benefit===false);
	const cannotGiftAid = !! (ownMoney===false || taxpayer===false || fromSale || benefit);
	
	// If we're disabling the checkbox, untick it too
	if (cannotGiftAid) {
		DataStore.setValue(path.concat('giftAid'), false, false);
	}

	// Explicitly tell user the result of their answers
	let giftAidMessage = '';
	if (canGiftAid) {
		giftAidMessage = (<p>
				Hooray: Your donation qualifies for Gift Aid!<br />
				If you pay less Income Tax and/or Capital Gains Tax in the current tax year than the amount
				of Gift Aid claimed on all your donations, it is your responsibility to pay any difference.
		</p>);
	} else if (cannotGiftAid) {
		giftAidMessage = (<p>This donation does not qualify for Gift Aid. 
				That's OK - many donations don't, and the difference is a small fraction.</p>
		);
	}

	let suff = canGiftAid || cannotGiftAid;
	setNavStatus({sufficient: suff, complete: cannotGiftAid || (canGiftAid && yesToGiftAid)});

	return (
		<div className='section donation-amount'>
			<img src='/img/giftaid-it-logo.gif' alt='Gift Aid It' />
			<p>
				GiftAid can add considerably to your donation at no extra cost.<br />
				Please answer the questions below to see if this donation qualifies for GiftAid.
			</p>
			<Misc.PropControl prop='giftAidOwnMoney' path={path} type='yesNo'
				label={`This donation is my own money. It has not come from anyone else e.g. a business, friends, or a collection.`}
			/>
			<Misc.PropControl prop='giftAidFundRaisedBySale' path={path} type='yesNo'
				label={`This is the proceeds from the sale of goods or provision of service e.g. a cake sale, auction or car wash.`}
			/>
			<Misc.PropControl prop='giftAidBenefitInReturn' path={path} type='yesNo'
				label={`I am receiving a benefit from this donation e.g. entry to an event, raffle or sweepstake.`}
			/>
			<Misc.PropControl prop='giftAidTaxpayer' path={path} type='yesNo'
				label={`I am a UK taxpayer.`}
			/>
			{giftAidMessage}
			<Misc.PropControl prop='giftAid' path={path} type='checkbox' disabled={ ! canGiftAid}
				label='I want to Gift Aid this donation, and agree to sharing my details for this.'
			/>
		</div>
	);
};

const DetailsSection = ({path, stagePath, setNavStatus}) => {
	const {giftAid, donorName, donorEmail, donorAddress, donorPostcode} = DataStore.getValue(path);
	const allDetails = donorName && donorEmail && donorAddress && donorPostcode;
	setNavStatus({sufficient: allDetails || ! giftAid, complete: allDetails});
	// dflt={Login.getUser() && Login.getUser().name} 
	// dflt={Login.getEmail()}
	return (
		// TODO do we have the user's details stored?	
		<div className='section donation-amount'>
			{giftAid? <p>These details will be passed to the charity so they can claim Gift-Aid.</p> 
				: <p>These details are optional: you can give anonymously.</p>}
			<Misc.PropControl prop='donorName' label='Name' placeholder='Enter your name' path={path} type='text' />
			<Misc.PropControl prop='donorEmail' label='Email' placeholder='Enter your address' path={path} type='email' />
			<Misc.PropControl prop='donorAddress' label='Address' placeholder='Enter your address' path={path} type='address' />
			<Misc.PropControl prop='donorPostcode' label='Postcode' placeholder='Enter your postcode' path={path} type='postcode' />
		</div>);
};

const MessageSection = ({path, recipient}) => (
	<div className='section donation-amount'>
		<Misc.PropControl 
			prop='message' 
			label='Message' 
			placeholder={`Do you have a message for ${recipient? recipient.name : 'them'}?`} 
			path={path} type='textarea' />
	</div>
);


/**
 * Process the actual payment! Which is done by publishing the Donation.
 * 
 * PaymentWidget talks to Stripe, then passes over to this method for the actual payment.
 * TODO refactor this into PaymentWidget
 */
const doPayment = ({donation}) => {
	DataStore.setData(donation);

	// invalidate credit if some got spent	
	let credit = Transfer.getCredit();
	if (credit && Money.value(credit) > 0) {
		DataStore.invalidateList(C.TYPES.Transfer);
	}

	// publish the donation NB: Crud.js will invalidate the list
	ActionMan.publishEdits(C.TYPES.Donation, donation.id, donation)
		.then(() => {
			const stagePath = ['location', 'params', 'dntnStage'];
			const stage = Number.parseInt(DataStore.getValue(stagePath));
			DataStore.setValue(stagePath, Number.parseInt(stage) + 1);
		});
};


const PaymentSection = ({path, item}) => {
	const donation = DataStore.getValue(path);
	if ( ! donation) {
		return null;
	}
	assert(C.TYPES.isDonation(getType(donation)), ['path',path,'donation',donation]);
	const {amount} = donation;
	if ( ! amount) {
		return null;
	}
	Money.assIsa(amount);
	/**
	 * Add the stripe token to the Donation object and publish the Donation
	 * @param {id:String, type:String, token:String} token 
	 */
	const onToken = (token) => {
		donation.stripe = token;
		doPayment({donation});
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
	);
};

export {DonateButton};
export default DonationForm;
