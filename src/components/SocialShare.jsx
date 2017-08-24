
// TODO move social share buttons from DonationForm here

import React from 'react';
import {assert, assMatch} from 'sjtest';
import {encURI} from 'wwutils';

import DataStore from '../plumbing/DataStore';
import C from '../C';

import MonetaryAmount from '../data/charity/MonetaryAmount';
import NGO from '../data/charity/NGO';
import Project from '../data/charity/Project';

import Misc from './Misc.jsx';

const SocialShare = ({charity, donation}) => {
	return (
		<div className='share-social-buttons'>
			<a className='share-social-twitter'><span className='fa fa-twitter' /></a>
			<a className='share-social-facebook'><span className='fa fa-facebook' /></a>
			<a className='share-social-email' 
				href={'mailto:?subject='+encURI(charity.name+" shared via SoGive")+'&body='+encURI(window.location)}
			>
				<span className='fa fa-envelope-o' />
			</a>
		</div>);
};

export default SocialShare;
