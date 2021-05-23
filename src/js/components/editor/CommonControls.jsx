
import React, { Component } from 'react';
import _ from 'lodash';

import {Card as BSCard} from 'reactstrap';
import Misc from '../../base/components/Misc';
import PropControl from '../../base/components/PropControl';
import Donation from '../../data/charity/Donation';

const SuggestedDonationEditor = ({item, path}) => {
	return (<BSCard body>
		<PropControl path={path} prop='amount' label='Amount' type='Money' />
		
		<PropControl label='Repeating?' type='radio' path={path} prop='repeat'
			options={['OFF','MINUTE','HOUR','WEEK','MONTH','YEAR']} labels={Donation.strRepeat} inline />

		<PropControl path={path} prop='name' label='Name (optional)' />
		<PropControl path={path} prop='text' label='Text (optional)' />
	</BSCard>);
};

export {
	SuggestedDonationEditor
};
