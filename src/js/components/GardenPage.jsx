import React from 'react';
import { assert, assMatch } from 'sjtest';
import Login from 'you-again';
import _ from 'lodash';
import { XId, encURI } from 'wwutils';

import printer from '../base/utils/printer';
// import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import Misc from '../base/components/Misc';
import {LoginLink} from '../base/components/LoginWidget';

const GardenPage = () => {
	return (
		<div className="page GardenPage">
			<Garden />
			<Hand />
		</div>
	);
}; // ./GardenPage

const Garden = () => {
	return <p>Garden</p>;
};

const Hand = () => {
	return <p>Hand</p>;
};

export default GardenPage;
