import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../base/utils/printer.js';
import C from '../C';
import Roles from '../base/Roles';

const E404Page = () => {
	return (
		<div className='E404Page'>
			<h2>Error 404: Page not found</h2>

			<p>
				Sorry: <code>{""+window.location}</code>is not a valid page url.
			</p>

		</div>
	);
};

export default E404Page;
