// https://github.com/winterstein/sogive-app/issues/74#issuecomment-321596033

// Provide £ to $ exchanges

import React from 'react';
import _ from 'lodash';
import { assert } from 'sjtest';
import {uid, yessy, encURI} from 'wwutils';

import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../base/plumbing/DataStore';
import Misc from '../Misc.jsx';
import C from '../../C';


class EditorDashboardPage extends React.Component {
	render() {
		// display...
		return (
			<div className="page ExchangeRatesPage">
				<h2>Exchange Rates</h2>
				<h3>In development...</h3>
			</div>
		);
	}
} // ./EditorDashboardPage
