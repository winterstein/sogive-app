import React from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest'
const assert = SJTest.assert;
import printer from '../utils/printer.js';
import C from '../C.js';

const Misc = {};

/**
E.g. "Loading your settings...""
*/
Misc.Loading = ({text}) => (<div><span className="glyphicon glyphicon-cd spinning"></span> Loading {text || ''}...</div>);


	/** eg a Twitter logo */
Misc.Logo = ({service}) => {
	const service = this.props.service;
	assert(service);
	let klass = "img-rounded logo";
	if (this.props.size) klass += "-"+this.props.size;
	let file = '/img/'+service+'-logo.svg';
	if (service==='instagram') file = '/img/'+service+'-logo.png';
	return (<img alt={service} className={klass} src={file} />);
}; // ./Logo

export default Misc;