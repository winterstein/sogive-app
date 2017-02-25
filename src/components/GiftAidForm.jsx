// @Flow
import React from 'react';
import { FormGroup, Checkbox } from 'react-bootstrap';


const GiftAidForm = ({
	handleChange,
	giftAid,
	giftAidTaxpayer,
	giftAidOwnMoney,
	giftAidNoCompensation,
	giftAidNoLottery,
}) => {
	// Gift Aiding? Check all these!
	const giftAidChecks = giftAid ? (
		<FormGroup>
			<p>Please tick all the following to confirm your donation is eligible for Gift Aid.</p>
			<Checkbox checked={giftAidTaxpayer} onChange={(event) => { handleChange('giftAidTaxpayer', event.target.checked); }}>
				I confirm that I am a UK taxpayer and I understand that if I pay less Income Tax and/or Capital Gains Tax in the current tax year than the amount of Gift Aid claimed on all my donations it is my responsibility to pay the difference.
			</Checkbox>
			<Checkbox checked={giftAidOwnMoney} onChange={(event) => { handleChange('giftAidOwnMoney', event.target.checked); }}>
				This is my own money. I am not paying in donations made by a third party e.g. money collected at an event, in the pub, a company donation or a donation from a friend or family member.
			</Checkbox>
			<Checkbox checked={giftAidNoCompensation} onChange={(event) => { handleChange('giftAidNoCompensation', event.target.checked); }}>
				I am not receiving anything in return for my donation e.g. book, auction prize, ticket to an event.
			</Checkbox>
			<Checkbox checked={giftAidNoLottery} onChange={(event) => { handleChange('giftAidNoLottery', event.target.checked); }}>
				I am not making a donation as part of a sweepstake, raffle or lottery.
			</Checkbox>
		</FormGroup>
	) : '';

	return (
		<div className='well well-sm'>
			<Checkbox checked={giftAid} onChange={(event) => handleChange('giftAid', event.target.checked)}>
				Yes, add Gift Aid &nbsp;
				<small><a target='_blank' href='https://www.cafonline.org/my-personal-giving/plan-your-giving/individual-giving-account/how-does-it-work/gift-aid'>
					Find out more about Gift Aid
				</a></small>
			</Checkbox>
			{ giftAidChecks }
		</div>
	);
};

export default GiftAidForm;
