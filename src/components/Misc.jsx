import React from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest';
const assert = SJTest.assert;
import printer from '../utils/printer.js';
import C from '../C.js';
import _ from 'lodash';
const Misc = {};

/**
E.g. "Loading your settings...""
*/
Misc.Loading = ({text}) => (
	<div>
		<span className="glyphicon glyphicon-cd spinning" /> Loading {text || ''}...
	</div>
);


const CURRENCY = {
	"GBP": "£",
	"USD": "$"
};
Misc.Money = ({amount,precision}) => {
	return <span>{CURRENCY[amount.currency] || ''}{printer.prettyNumber(amount.value)}</span>;
};
/**
 * Handle a few formats, inc gson-turned-a-Time.java-object-into-json
 */
Misc.Time = ({time}) => {
	try {
		if (_.isString(time)) {
			return <span>{new Date(time).toLocaleDateString()}</span>;			
		}
		if (time.ut) {
			return <span>{new Date(time.ut).toLocaleDateString()}</span>;
		}
		return <span>{printer.str(time)}</span>;
	} catch(err) {
		return <span>{printer.str(time)}</span>;
	}
};

	/** eg a Twitter logo */
Misc.Logo = ({service, size, transparent}) => {
	assert(service);
	let klass = "img-rounded logo";
	if (size) klass += "-"+size;
	let file = '/img/'+service+'-logo.svg';
	if (service==='instagram') file = '/img/'+service+'-logo.png';
	if (service==='sogive') {
		file = '/img/logo.png';
		if (transparent === false) file = '/img/SoGive-Light-70px.png';
	}
	return (
		<img alt={service} data-pin-nopin="true" className={klass} src={file} />
	);
}; // ./Logo

Misc.Checkbox = ({on, label, onChange}) => (
	<div className="checkbox">
		<label>
			<input onChange={onChange} type="checkbox" checked={on || false} /> {label}
		</label>
	</div>
);

Misc.ImpactDesc = ({unitImpact, amount}) => {
	if (unitImpact && unitImpact.number && unitImpact.name) {
		return <div>{`will fund ${printer.prettyNumber(unitImpact.number * amount)} ${unitImpact.name}`}</div>;
	}
	return null;
};

export default Misc;
