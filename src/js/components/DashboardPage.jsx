import React from 'react';
import { assert, assMatch } from 'sjtest';
import Login from 'you-again';
import _ from 'lodash';
import { XId, encURI } from 'wwutils';

import printer from '../base/utils/printer';
// import C from '../C';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
// import ChartWidget from './../base/components/ChartWidget';
import Misc from '../base/components/Misc';
import {LoginLink} from '../base/components/LoginWidget';

const DashboardPage = () => {
	// display...
	return (
		<div className="page DashboardPage">
			<h2>My Dashboard</h2>
		</div>
	);
}; // ./DashboardPage


export default DashboardPage;
