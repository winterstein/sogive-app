
import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import { Button, Modal, ModalHeader, ModalBody, Row, Col, Alert } from 'reactstrap';
import Login from '../base/youagain';
import $ from 'jquery';

import C from '../C';
import printer from '../base/utils/printer';
import ActionMan from '../plumbing/ActionMan';

import DataStore from '../base/plumbing/DataStore';
import NGO from '../data/charity/NGO2';
import FundRaiser from '../data/charity/FundRaiser';
import Donation from '../data/charity/Donation';
import Transfer from '../base/data/Transfer';
import Money from '../base/data/Money';
import Basket from '../data/Basket';

import Misc from '../base/components/Misc';
import PropControl from '../base/components/PropControl';
import { getId, getStatus, getType, nonce } from '../base/data/DataClass';
import PaymentWidget from '../base/components/PaymentWidget';
import { RegisterLink } from '../base/components/LoginWidget';
import Wizard, {WizardStage} from '../base/components/WizardProgressWidget';
import {notifyUser} from '../base/plumbing/Messaging';
import {errorPath} from '../base/plumbing/Crud';
import XId from '../base/data/XId';
import Ticket from '../data/charity/Ticket';
import { space } from '../base/utils/miscutils';
import KStatus from '../base/data/KStatus';
import { assert } from '../base/utils/assert';


const widgetPath = ['widget', 'DonationWizard'];

const setWidgetProp = (forItem, prop, value, update) => (
	DataStore.setValue([...widgetPath, forItem, prop], value, update)
);

const getWidgetProp = (forItem, prop) => (
	DataStore.getValue([...widgetPath, forItem, prop])
);


/**
 * TODO Doc notes on the inputs to this. the charity profile sends in charity and project.
 */

/**
 * NB: We can have several DonateButtons, but only one modal form
 */
const DonateButton = ({item, paidElsewhere, isOutlined = false, isLarge = true, ...props}) => {
	if (NGO.noPublicDonations(item)) {
		return null;
	}
	assert(item && getId(item), "DonationWizard.js - DonateButton: no item "+item);

	// no donations to draft fundraisers or charities
	if (false && (item.status === C.KStatus.DRAFT || item.status === C.KStatus.MODIFIED)) {
		return (
			<button className="btn btn-lg btn-primary disabled" type="button"
				title="This is a draft preview page - publish to actually donate">Donate</button>
		);
	}

	const showWizard = getWidgetProp(getId(item), 'open');
	
	return <>
		<Button 
			color="primary"
			outline={isOutlined}
			size={isLarge ? "lg" : "md"}
			onClick={() => {
				// poke the paidElsewhere flag
				setWidgetProp(getId(item), 'paidElsewhere', paidElsewhere, false);
				setWidgetProp(getId(item), 'open', true);
			}}
		>
			Donate
		</Button>
		{ showWizard ? <DonationWizard item={item} {...props} /> : null }
	</>;
};

/**
 * The main click-here-to-donate widget
 *
 * @param item: a FundRaiser or NGO
 * @param fromEditor ??
 *
 * Warning: Only have ONE of these on a page! Otherwise both will open at once!
 *
 * TODO refactor this
 */
const DonationWizard = ({item, charity, causeName, fromEditor}) => {
	const id = getId(item);
	assert(id, "ImpactCalculator", item);
	assert(NGO.isa(item) || FundRaiser.isa(item) || Basket.isa(item), "DonationWizard.jsx - odd item!", item);
	if ( ! causeName) causeName = item.displayName || item.name || id;
	let pvEvent = {};
	if ( ! charity) {
		if (NGO.isa(item)) charity = item;
		else if (FundRaiser.isa(item)) {
			charity = FundRaiser.charity(item);
			let eventId = FundRaiser.eventId(item);
			if (eventId) pvEvent = ActionMan.getDataItem({type:C.TYPES.Event, id:eventId, status:C.KStatus.PUBLISHED});
		}
	}

	// From an event?
	const event = pvEvent.value;

	// £/$
	let preferredCurrency = null;
	if (event && event.country) {
		preferredCurrency = Money.CURRENCY_FOR_COUNTRY[event.country];
	}

	// There can only be one!
	// TODO move this to Misc for reuse TODO reuse this safety test with other only-one-per-page dialogs
	// TRYING THIS: ?? maybe replace the assert with a more lenient return null??

	// Shared store location for "a modal donation widget is open"
	const rpath = ['transient', 'render'].concat(widgetPath);

	// Assign this particular instance of the widget a unique identifier on mount
	const [widgetId] = useState(nonce()); 

	// On mount, claim the "only donation modal" position if it's available
	useEffect(() => {
		if (!DataStore.getValue(rpath)) DataStore.setValue(rpath, widgetId);
		// On unmount, release it again
		return () => {
			if (DataStore.getValue(rpath) === widgetId) DataStore.setValue(rpath, null);
		};
	}, []);

	// A widget is already drawn for the specified item - and it's not this one? Do nothing.
	if (DataStore.getValue(rpath) !== widgetId) {
		console.log('DonationWizard: Not rendering additional components');
		return null;
	}

	// what stage?
	const stagePath = ['location', 'params', 'dntnStage'];
	const stage = Number.parseInt(DataStore.getUrlValue('dntnStage'));

	// not open? just show the button
	let isOpen = getWidgetProp(id, 'open');
	// THERE IS DEFINITELY A BETTER WAY OF CHECKING THIS. I JUST HAD TO ADD ISNAN TO THE LIST OF "THINGS STAGE SHOULD NOT BE" RIGHT BEFORE A DEMO.
	if (isOpen === undefined || isOpen === null) {
		isOpen = stage !== undefined && stage !== null && !isNaN(stage);
	}
	if (!isOpen) return null;

	// paid elsewhere, or (the default) paid here?
	let paidElsewhere = getWidgetProp(id, 'paidElsewhere');

	const pvDonationDraft = ActionMan.getDonationDraft({item});

	// close dialog and reset the wizard stage
	const closeLightbox = () => {
		setWidgetProp(id, 'open', false);
		DataStore.setValue(stagePath, null);
		const donation = pvDonationDraft.value || {};
		// Donation is PUBLISHED or has a Stripe token? It's completed, and it shouldn't show up again next time the lightbox opens.
		// We checked for PUBLISHED status before - BUT the draft under draft.Donation.from:donorId.to:itemId isn't marked as such. 
		// TODO Stripe ID will also be truthy for a declined transaction - there's no indication that the token is bad
		// until we publish and DonationServlet tries to redeem it. Mark declined on publish & retain the draft so user can try another card
		
		if (getStatus(donation)===KStatus.PUBLISHED || (donation.stripe && donation.stripe.id)) {
			ActionMan.clearDonationDraft({donation});
		} else {
			console.log("Keep draft donation",getId(donation),donation);
		}
	};

	// get/make the draft donation
	let type = C.TYPES.Donation;
	// if the promise is running, wait for it before making a new draft
	if (!pvDonationDraft.resolved) {
		return (
			<Modal isOpen={isOpen} className="donate-modal" toggle={closeLightbox}>
				<ModalBody>
					<Misc.Loading />
				</ModalBody>
			</Modal>
		);
	}

	let donationDraft = pvDonationDraft.value;
	Donation.assIsa(donationDraft);
	
	const path = DataStore.getDataPath({status:C.KStatus.DRAFT, type, id:donationDraft.id});
	
	// Don't ask for gift-aid details if the charity doesn't support it
	const showGiftAidSection = charity && charity[NGO.PROPS.$uk_giftaid()];
	// We don't need to collect address etc. if we're not collecting gift-aid
	const showDetailsSection = true; // hm - the UX flow is a bit odd with this popping in. DataStore.getValue(path.concat('giftAid'));
	// You don't send messages to charities...
	const showMessageSection = FundRaiser.isa(item);

	// get (set) the amount
	// NB: do this here, not in AmountSection, as there are use cases where amount section doesnt get rendered.
	let credit = Transfer.getCredit();
	let suggestedDonations = item.suggestedDonations || (event && event.suggestedDonations) || [];
	const proposedSuggestedDonation = getSetDonationAmount({path, item, credit, suggestedDonations, event});
	Money.assIsa(proposedSuggestedDonation.amount, proposedSuggestedDonation);
	const amount = DataStore.getValue(path.concat("amount"));
	// NB: this should always be true, cos getSetDonationAmount sets it to a default
	const amountOK = amount !== null && Money.value(amount) > 0.7; // avoid 1p donations

	const emailOkay = C.emailRegex.test(DataStore.getValue(path.concat("donorEmail")));
	// if ( ! emailOkay) console.warn("email not OK", DataStore.getValue(path.concat("donorEmail")));

	// isOpen is always true - since we 

	return (
		<Modal isOpen className="donate-modal" toggle={closeLightbox}>
			<ModalHeader toggle={closeLightbox}>Donate to {causeName}</ModalHeader>
			<ModalBody>
				<Wizard stagePath={stagePath}>
					<WizardStage title="Amount" sufficient={amountOK} complete={amountOK}>
						<AmountSection path={path} fromEditor={fromEditor} item={item}
							paidElsewhere={paidElsewhere} credit={credit}
							proposedSuggestedDonation={proposedSuggestedDonation}
							suggestedDonations={suggestedDonations}
							event={event}
							preferredCurrency={preferredCurrency}
						/>
					</WizardStage>

					{showGiftAidSection? <WizardStage title="Gift Aid">
						<GiftAidSection path={path} charity={charity} stagePath={stagePath} setNavStatus />
					</WizardStage> : null}
				
					{showDetailsSection? <WizardStage title="Details" sufficient={emailOkay} complete={emailOkay}>
						<DetailsSection path={path} stagePath={stagePath} fromEditor={fromEditor} />
					</WizardStage> : null}
				
					{showMessageSection? <WizardStage title="Message">
						<MessageSection path={path} recipient={item.owner} item={item} />
					</WizardStage> : null}
				
					<WizardStage title="Payment" next={false}>
						<PaymentSection path={path} donation={donationDraft} item={item} event={event} paidElsewhere={paidElsewhere} closeLightbox={closeLightbox} />
					</WizardStage>

					<WizardStage title="Receipt" previous={false}>
						<ThankYouSection path={path} item={item} did={donationDraft.id} />
					</WizardStage>
				</Wizard>
			</ModalBody>
			<Misc.SavePublishDiscard type={type} id={donationDraft.id} hidden />
		</Modal>
	);
}; // ./ImpactCalculator


/**
 * @param {boolean} paidElsewhere Are they reporting an off-SoGive donation?
 * @param {NGO|FundRaiser} item 
 * @param {?Money} credit 
 * @param {!SuggestedDonation} proposedDonationValue Assumed setup already
 */
const AmountSection = ({path, item, fromEditor, paidElsewhere, credit,
	proposedSuggestedDonation, suggestedDonations, event, preferredCurrency}) =>
{
	const dntn = DataStore.getValue(path) || {};
	if (preferredCurrency === 'GBP') preferredCurrency = null; // HACK GBP is the default
	// How much £?
	const val = proposedSuggestedDonation.amount;
	if (Money.hasValue(val) && ! Money.hasValue(dntn.amount)) {
		dntn.amount = Object.assign({}, val);
		DataStore.setValue(path, dntn, false);
	}
	
	// What repeat options?
	let repeatDonations = event ? ['OFF'] : ['OFF', 'MONTH', 'YEAR']; // NB: always offer monthly/annual repeats for charities
	repeatDonations.push(proposedSuggestedDonation.repeat);
	suggestedDonations.forEach(sd => repeatDonations.push(sd.repeat));
	repeatDonations.push(dntn.repeat); // if something is set, then include it
	// no dupes, no nulls
	repeatDonations = _.uniq(repeatDonations.filter(rd => rd));

	// HACK default to stopping with the event
	if (event && Donation.isRepeating(dntn) && dntn.repeatStopsAfterEvent === undefined) {
		dntn.repeatStopsAfterEvent = true;
	}
	
	// Offer repeating donations?
	let showRepeatControls = true;
	// Off for an event?
	// NB: always show the controls if the donation _is_ repeating, or repeats are suggested, 'cos they're needed
	if (event && ! dntn.repeat && repeatDonations.length===0) {
		// must be switched on in the event
		if ( ! event.allowOngoingDonations) {
			showRepeatControls = false;			
		}
		// Disallow repeat donations if the event has already passed
		// Use-case: the event had pay-in-installments options, which are now invalid.
		// Minor TODO it'd be better to screen those out of the suggestedDonations
		const eventExpired = event.date && new Date() > new Date(event.date);
		if (eventExpired) {
			showRepeatControls = false;
		}		
	}
	if (event) {
		// Suggested repeat? If not, default to one-off, no repeats
		if (showRepeatControls && dntn.repeat === undefined) {
			dntn.repeat = proposedSuggestedDonation.repeat || 'OFF';
		}
	}
	// are they reporting an off-SoGive donation?
	if (paidElsewhere) {
		showRepeatControls = dntn.repeat && true; // false unless dntn.repeat is somehow set
		suggestedDonations = []; // no suggested donations as this is for logging ad-hoc external payments
	}

	return (
		<div className="section donation-amount">
			
			{suggestedDonations.length? <h4>Suggested Donations</h4>: null}
			{suggestedDonations.map((sd, i) => <SDButton key={i} sd={sd} path={path} donation={dntn} />)}
			
			{preferredCurrency?
				<CurrencyConvertor path={path} preferredCurrency={preferredCurrency} val={val} />
				:
				<PropControl prop="amount" path={path} type="Money" label="Donation"
					value={val} changeCurrency={false} min={new Money(1)} 
					append={Donation.isRepeating(dntn)? "per "+dntn.repeat.toLowerCase() : null}
				/>				
			}
			{Money.value(credit) ? <p><i>You have <Misc.Money amount={credit} /> in credit.</i></p> : null}
			
			{showRepeatControls ?
				<PropControl type="radio" path={path} prop="repeat"
					options={repeatDonations} labels={Donation.strRepeat} inline
				/> : null}
			{event && showRepeatControls && Donation.isRepeating(dntn) ?			
				<PropControl
					label="Stop recurring donations after the event? (you can also cancel at any time)"
					type="checkbox"
					path={path} prop="repeatStopsAfterEvent"
				/> : null}
		</div>);
}; // ./AmountSection


const CurrencyConvertor = ({path, val, preferredCurrency='USD', onChange}) => {
	let transPath = ['transient'].concat(path);
	let trans = DataStore.getValue(transPath);

	// NB: this is X:Euros for each currency, so needs to be combined for USD->GBP
	let pvRate = DataStore.fetch(['misc','forex','rates'], () => {
		let got = $.get('http://api.exchangeratesapi.io/v1/latest?access_key=5ddbce9daf299ed4b46804a0101c5046&symbols=GBP,'+preferredCurrency);
		// https://lg.good-loop.com/data?dataspace=fx&q=evt:currrate&sort=time&size=1
		return got;
	});

	let rate = 0.80341;
	if (pvRate.value && pvRate.value.rates) {
		try {
			rate = pvRate.value.rates.GBP / pvRate.value.rates[preferredCurrency];
			console.warn(preferredCurrency+"->GBP "+rate, pvRate.value);
		} catch(err) {	// paranoia (bugs, Nov 2021)
			console.error(err); // swallow it
		}
	}

	return <>
		<Row>
			<Col md="6" sm="12">
				<PropControl prop="localAmount" currency={preferredCurrency} changeCurrency={false} path={transPath} type="Money"
					label={'Donation ('+Money.CURRENCY[preferredCurrency]+')'} onChange={e => {
						let dollars = e.target.value;
						let pounds = dollars ? Math.round(rate*dollars*100) / 100 : null;
						console.warn(`setting £ donation from local amount: ${pounds} => ${dollars}`);
						DataStore.setValue(path.concat('amount'), new Money(pounds));
						DataStore.setModified(path.concat('amount'));
						return onChange(e);
					}}
				/>
			</Col>
			<Col md="6" sm="12">
				<PropControl prop="amount" path={path} type="Money" label="= Donation (£)" value={val} changeCurrency={false}
					onChange={e => {
						let pounds = e.target.value;
						let dollars = pounds ? Math.round(pounds*100 / rate) / 100 : null;
						console.warn(`setting local donation from £ amount: $${dollars} => £${pounds}`);
						DataStore.setValue(transPath.concat('localAmount'), new Money({currency:preferredCurrency, value:dollars}));
						return onChange(e);
					}}
				/>
			</Col>
		</Row>
		<div><small>Approximate rate: 1 {preferredCurrency} = {printer.toNSigFigs(rate, 4)} GBP (source: ECB). SoGive is based in the UK and we work in £ sterling.
		Currency conversion is handled by your bank - the rate they apply is likely to be a bit worse.</small></div>
	</>;
};


const SDButton = ({path, sd, donation}) => {
	if (!sd.amount) return null; // defend against bad data
	Money.assIsa(sd.amount, "SDButton");
	let on = donation && Money.eq(donation.amount, sd.amount) && donation.repeat === sd.repeat;
	// on click, set stuff
	const clickSuggestedButton = e => {
		let amnt = { ...sd.amount };
		delete amnt['@class'];
		DataStore.setModified(path.concat('amount'));
		DataStore.setValue(path.concat('amount'), amnt);
		DataStore.setValue(path.concat('repeat'), sd.repeat); // NB this can set null
	};

	return (
		<Button className={`mr-2 suggested-donation${on ? ' active' : ''}`} onClick={clickSuggestedButton}>
			{sd.name ? <span>{sd.name} </span> : null}
			<Misc.Money amount={sd.amount} />
			{sd.repeat ? <span> {Donation.strRepeat(sd.repeat)}</span> : null}
			{sd.text ? <div className="btn-smallprint">{sd.text}</div> : null}
		</Button>
	);
};


/**
 * This can set the Donation.amount to a default value as a side-effect
 * @param item {Donation}
 * @param credit {?Money}
 * @param suggestedDonations {?SuggestedDonation[]}
 * @param path {String[]} path to Donation item
 * @returns {SuggestedDonation}
 */
const getSetDonationAmount = ({path, item, credit, suggestedDonations, event}) => {
	const dntn = DataStore.getValue(path) || DataStore.setValue(path, {});
	let val = Donation.amount(dntn);
	// Preserve user set values
	if (DataStore.isModified(path.concat('amount'))) {
		if ( ! val) val = new Money();
		return {amount:val, repeat:dntn.repeat};
	}
	const sd = getSetDonationAmount2({path, item, credit, suggestedDonations, event});
	// side-effect: set
	dntn.amount = sd.amount;
	// dont overwrite repeat - so you can set it off before setting a £amount
	if ( ! dntn.repeat) dntn.repeat = sd.repeat;
	return sd;
};

/**
 *
 * @returns {SuggestedDonation}
 */
const getSetDonationAmount2 = ({path, item, credit, suggestedDonations, event}) => {
	// Set to amount of user's credit if present
	if (credit && credit.value) {
		return {amount:credit, repeat:'OFF'};
	}
	// fundraiser target?
	let target = item.target;
	
	// Set to suggested donation?
	if (suggestedDonations && suggestedDonations.length) {
		const sd = suggestedDonations[0];
		return sd;
	}

	// HACK: grab the amount from the impact widget of ImpactCalculator?
	const dontn = DataStore.getValue(path);
	let cid = Donation.to(dontn);
	let val = DataStore.getValue(['widget', 'ImpactCalculator', cid, 'amount']);
	let amount = Money.isa(val)? val : new Money({value:val});
	let repeat = event ? 'OFF' : 'MONTH';
	return {amount, repeat};
};


const GiftAidSection = ({path, charity, stagePath, setNavStatus}) => {
	assert(stagePath, "GiftAidSection no stagePath");
	const donation = DataStore.getValue(path);
	const ownMoney = donation.giftAidOwnMoney;
	const fromSale = donation.giftAidFundRaisedBySale;
	const benefit = donation.giftAidBenefitInReturn;
	const taxpayer = donation.giftAidTaxpayer;
	const yesToGiftAid = donation.giftAid;
			
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

	if (setNavStatus) {
		const sufficient = canGiftAid || cannotGiftAid;
		const complete = cannotGiftAid || (canGiftAid && yesToGiftAid);
		setNavStatus({sufficient, complete});
	}

	return (
		<div className="section donation-amount">
			<img src="/img/giftaid-it-logo.gif" alt="Gift Aid It" />
			<p>
				GiftAid can add considerably to your donation at no extra cost.<br />
				Please answer the questions below to see if this donation qualifies for GiftAid.
			</p>
			<PropControl prop="giftAidOwnMoney" path={path} type="yesNo"
				label="This donation is my own money. It has not come from anyone else e.g. a business, friends, or a collection."
			/>
			<PropControl prop="giftAidFundRaisedBySale" path={path} type="yesNo"
				label="This is the proceeds from the sale of goods or provision of service e.g. a cake sale, auction or car wash."
			/>
			<PropControl prop="giftAidBenefitInReturn" path={path} type="yesNo"
				label="I am receiving a benefit from this donation e.g. entry to an event, raffle or sweepstake."
			/>
			<PropControl prop="giftAidTaxpayer" path={path} type="yesNo"
				label="I am a UK taxpayer."
			/>
			{giftAidMessage}
			<PropControl prop="giftAid" path={path} type="checkbox" disabled={ ! canGiftAid}
				label="I want to Gift Aid this donation, and agree to sharing my details for this."
			/>
		</div>
	);
};

const DetailsSection = ({path, charity, fromEditor}) => {
	const {giftAid} = DataStore.getValue(path);

	// Do we have the user's details stored?
	// let user = Login.getUser();
	// let name = user && user.name;
	// let email = user && user.xid && XId.service(user.xid) === 'email' && XId.id(user.xid);
	// TODO PropControl dflt doesn't properly work

	// dflt={Login.getUser() && Login.getUser().name}
	// dflt={Login.getEmail()}
	let reqrd = giftAid;
	return (
		<div className="section donation-amount">
			{giftAid? <p>These details will be passed to the charity so they can claim Gift-Aid.</p> : null}
			{fromEditor? <PropControl label="Donor ID" path={path} prop="from" /> : null}
			<PropControl prop="donorName" label="Name" placeholder="Enter your name" path={path} type="text" required={reqrd} optional={ ! reqrd} />
			<PropControl prop="donorEmail" label="Email" placeholder="Enter your address" path={path} type="email" required />
			<PropControl prop="donorAddress" label="Address" placeholder="Enter your address" path={path} type="address" required={reqrd} optional={ ! reqrd} />
			<PropControl prop="donorPostcode" label="Postcode" placeholder="Enter your postcode" path={path} type="postcode" required={reqrd} optional={ ! reqrd} />
			{ ! giftAid? <PropControl prop="consentToSharePII"
				label={'Can '+(charity? NGO.displayName(charity) : 'the charity')+' use these details to contact you?'}
				path={path} type="checkbox" />
				: null}
		</div>);
};


const MessageSection = ({path, recipient, item}) => (
	<div className="section donation-amount">
		<PropControl
			prop="message"
			label="Message"
			placeholder={`Do you have a message for ${recipient? recipient.name : 'them'}?`}
			path={path} type="textarea"
		/>

		<p>
			By default we list your name and the amount.
			Your name, amount, and your email are also shared with the organiser.
		</p>
		<PropControl prop="anonymous" label="Give anonymously?" path={path} type="checkbox"
			help={item && item.shareDonorsWithOrganiser && DataStore.getValue(path.concat('anonymous'))?
				"Your name will not be listed on the website. However your name, email, and donation will still be shared with the organiser" : null}
		/>

		<PropControl prop="anonAmount" label="Don't show the donation amount?" path={path} type="checkbox" />

	</div>
);


/**
 * Process the payment - Which is done by publishing the Donation.
 *
 * Note: Most of the time, Stripe will have already collected the money
 * 
 * PaymentWidget talks to Stripe, then passes over to this method.
 */
const onToken_doPayment = ({donation}) => {
	DataStore.setData(C.KStatus.DRAFT, donation);
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
			// Don't delete the donation! We still need it to show the right amount in the receipt.
			// Published donation draft will be cleared from the draft path when the widget closes.
			// do a fresh load of the fundraiser?
			// NB: race condition with ES indexing might mean our donation doesn't show up instantly :(
			if (donation.fundRaiser) {
				ActionMan.refreshDataItem({type:C.TYPES.FundRaiser, id:donation.fundRaiser, status:C.KStatus.PUBLISHED});
			} else {
				console.log("DonationWizard doPayment - no fundraiser to refresh", donation);
			}
		});
	// TODO Catch a 400 (normally signifies payment declined) and mark the donation draft as "not completed"
};


const TQ_PATH = ['widget', 'ThankYouSection', 'donation'];

const PaymentSection = ({path, donation, item, event, paidElsewhere, closeLightbox}) => {
	// HACK - store info for the TQ section
	DataStore.setValue(TQ_PATH, donation, false);

	assert(C.TYPES.isDonation(getType(donation)), "DonationWziard.jsx - Not a donation?!", ['path',path,'donation',donation]);
	assert(NGO.isa(item) || FundRaiser.isa(item) || Basket.isa(item), "DonationWizard.jsx - PaymentSection - odd item", item);
	if ( ! donation) {
		return null;
	}
	
	const {amount} = donation;
	if ( ! amount) {
		return null;
	}
	Money.assIsa(amount);

	// tip? default: £1
	if (donation.hasTip === undefined) donation.hasTip = true;
	// Is there a Ticket with kind=Tip?
	let tipTicket = event && event.ticketTypes && event.ticketTypes.find(Ticket.isTip);
	if (donation.tip === undefined) {
		donation.tip = tipTicket? Ticket.price(tipTicket) : new Money({currency:'GBP', value:1});
	}
	let tipLabel =`Include a tip to cover SoGive's operating costs?`;	
	if (tipTicket) {
		tipLabel = [tipTicket.subtitle, tipTicket.description].filter(x => x).join(': ') || 'Include a tip to cover costs?';
		if (donation.tip) donation.tip.name = tipTicket.name;
	}
	// ...add in the tip to the total
	let amountPlusTip = amount;
	if (donation.tip && donation.hasTip) amountPlusTip = Money.add(amount, donation.tip);

	// repeating?
	let repeat;
	if (Donation.isRepeating(donation)) {
		repeat = {
			amount,
			freq: donation.repeat
		};
	}

	// Not the normal payment?
	if (paidElsewhere) {
		donation.paidElsewhere = true;
		return (<div>
			<p>This form is for donations that have already been paid.</p>
			<PropControl label="Where did the payment come from?" prop="paymentMethod" path={path} type="text" />
			<PropControl label="Payment ID, if known?" prop="paymentId" path={path} type="text" />
			<Button color="primary" onClick={e => {
				ActionMan.publishEdits(C.TYPES.Donation, donation.id, donation)
					.then(res => {
						notifyUser('Off-site donation published - reload to see');
						closeLightbox();
					});
			}}>Publish Donation</Button>
		</div>);
	}

	/**
	 * Add the completed PaymentIntent to the Donation object and publish the Donation
	 * TODO The signatures below aren't accurate since the Dec 2020 API migration
	 * @param {id:String, type:String, token:String} token
	 *  |source owner: {email, verified_email}
	 */
	const onToken = (payment_intent) => {
		console.log('onToken called with:', payment_intent);
		donation.stripe = payment_intent; // ?? also set paymentId?
		onToken_doPayment({donation});		
	};

	let payError = DataStore.getValue(errorPath({type:getType(donation), id:donation.id, action:'publish'}));

	return (<div>
		<div className="padded-block">
			<PropControl type="checkbox" path={path} item={donation} prop="hasTip" label={tipLabel} />
			<PropControl type="Money" path={path} item={donation} prop="tip" min={new Money(0)}
				label={space('Amount', Donation.isRepeating(donation) && '(one-off payment)')} disabled={donation.hasTip===false}
			/>
		</div>
		{getStatus(donation)==KStatus.PUBLISHED || getStatus(donation)==KStatus.MODIFIED? 
			<Alert color="warning">This donation has already been made. Please reload the page if you want to make another donation.</Alert>
			: <PaymentWidget onToken={onToken} amount={amountPlusTip} recipient={item.name} error={payError} repeat={repeat} basketId={donation.id} />
		}
	</div>);
}; // ./PaymentSection


/**
 *
 * @param {String} did The donation ID - status: not used!
 */
const ThankYouSection = ({path, item, did}) => {
	let donation = DataStore.getValue(path);
	// HACK pay->publish can confuse this losing the old donation object
	if ( ! donation || ! Money.value(donation.amount)) {
		donation = DataStore.getValue(TQ_PATH);
	}
	// Did we get a tip? NB: ignore tip=0	
	let amountPlusTip;
	if (donation.tip && donation.hasTip && Money.value(donation.tip)) {
		amountPlusTip = Money.add(donation.amount, donation.tip);
	}

	// pull this out to make "We've received..." a one-liner & make natural spacing easy
	const repeat = Donation.isRepeating(donation) ? <span> {Donation.strRepeat(donation.repeat)} </span> : null;

	const registerMessage = (<>
		<p>Would you like to quickly create a SoGive account?</p>
		<p>You can <RegisterLink style={{textTransform: 'lowercase'}}> here</RegisterLink></p>
	</>);

	return (
		<div className="text-center">
			<h3>Thank You!</h3>
			<big>
				<p>We've received your donation of <Misc.Money amount={donation.amount} /> {repeat} to {item.name}</p>
				{amountPlusTip ? <p>(plus a tip of <Misc.Money amount={donation.tip} /> to cover costs). <br /></p> : null}
				<p>Thanks for using SoGive!</p>
				{Login.user ? '' : registerMessage}
			</big>
		</div>
	);
};


export { DonateButton };
export default DonationWizard;
