// @Flow
import React from 'react';
import { FormGroup } from 'react-bootstrap';

import DataStore from '../plumbing/DataStore';

import Misc from './Misc';

const giftAidTaxpayerLabel = 'I confirm that I am a UK taxpayer and I understand that if I pay less Income Tax and/or Capital Gains Tax in the current tax year than the amount of Gift Aid claimed on all my donations it is my responsibility to pay the difference.';
const giftAidOwnMoneyLabel = 'This is my own money. I am not paying in donations made by a third party e.g. money collected at an event, in the pub, a company donation or a donation from a friend or family member.';
const giftAidNoCompensationLabel = 'I am not receiving anything in return for my donation e.g. book, auction prize, ticket to an event, or donating as part of a sweepstake, raffle or lottery.';


const GiftAidForm = ({ formPath }) => {
	const {giftAid} = DataStore.getValue(formPath);
	
	// Gift Aiding? Check all these!
	const giftAidChecks = giftAid ? (
		<FormGroup>
			<p>Please tick all the following to confirm your donation is eligible for Gift Aid.</p>
			<Misc.PropControl prop='giftAidTaxpayer' label={giftAidTaxpayerLabel} path={formPath} type='checkbox' />
			<Misc.PropControl prop='giftAidOwnMoney' label={giftAidOwnMoneyLabel} path={formPath} type='checkbox' />
			<Misc.PropControl prop='giftAidNoCompensation' label={giftAidNoCompensationLabel} path={formPath} type='checkbox' />
			<p>Please provide the following details to enable your selected charity to process Gift Aid.</p>
			<Misc.PropControl prop='name' label='Name' placeholder='Enter your name' path={formPath} type='checkbox' />
			<Misc.PropControl prop='address' label='Address' placeholder='Enter your address' path={formPath} type='checkbox' />
			<Misc.PropControl prop='text' label='Postcode' placeholder='Enter your postcode' path={formPath} type='checkbox' />
			<small>I understand that my name and address may be shared with the charity for processing Gift Aid.</small>
		</FormGroup>
	) : '';

	return (
		<div className='upper-margin col-md-12 giftAid'>
			<Misc.PropControl prop='giftAid' label='Yes, add Gift Aid' path={formPath} type='checkbox' />
			<small><a target='_blank' href='https://www.cafonline.org/my-personal-giving/plan-your-giving/individual-giving-account/how-does-it-work/gift-aid'>
				Find out more about Gift Aid
			</a></small>
			{ giftAidChecks }
		</div>
	);
};

export default GiftAidForm;
