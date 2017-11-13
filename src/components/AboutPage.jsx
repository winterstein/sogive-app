import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../utils/printer.js';
import C from '../C';
import Roles from '../Roles';
import Misc from './Misc';

const AboutPage = () => {
	return (
		<div className='AboutPage'>
			<h2>About SoGive</h2>

			<p>Please see our website for more information on SoGive: <a href='https://sogive.org'>https://sogive.org</a></p>

			<p>We are grateful to SMART:Scotland and The Hunter Foundation for their support.</p>

			<p>This app uses data from various sources:</p>
			<ul>
				<li>&copy; Crown Copyright and database right 2017. Contains information from the Scottish Charity Register supplied by the Office of the Scottish Charity Regulator and licensed under the Open Government Licence v.2.0.
					See <a href='https://www.oscr.org.uk/charities/search-scottish-charity-register/charity-register-download'>OSCR Charity Register Download</a>.
				</li>
			</ul>

		</div>
	);
};

export default AboutPage;
