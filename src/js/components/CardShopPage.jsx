// @Flow
import React from 'react';
import _ from 'lodash';
import MDText from '../base/components/MDText'
import {assert} from 'sjtest';
import {yessy, encURI} from 'wwutils';
import { Tabs, Tab, Button, Panel, Image, Well, Label } from 'react-bootstrap';
import Roles from '../base/Roles';
import ServerIO from '../plumbing/ServerIO';
import ActionMan from '../plumbing/ActionMan';
import DataStore from '../base/plumbing/DataStore';
import printer from '../base/utils/printer';
import C from '../C';
import NGO from '../data/charity/NGO2';
import Project from '../data/charity/Project';
import Output from '../data/charity/Output';
import Citation from '../data/charity/Citation';
import Misc from '../base/components/Misc';
import Login from 'you-again';
import DonationWizard, {DonateButton} from './DonationWizard';
import CharityPageImpactAndDonate from './CharityPageImpactAndDonate';
import SocialShare from './SocialShare';
import {CreateButton} from '../base/components/ListLoad';

const CardShopPage = () => {
	return (<>
		Why
		How
		<XmasCard />
		Checkout
	</>);
};

const XmasCard = () => {
	return "Xmas Card";
};

export default CardShopPage;
