import React from 'react';
import ReactDOM from 'react-dom';

import { assert } from 'sjtest';
import _ from 'lodash';

import printer from '../utils/printer';
import C from '../C';

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
Misc.Money = ({amount, precision}) => {
	if (_.isNumber(amount) || _.isString(amount)) {
		amount = {value: amount, currency:'GBP'};
	}
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
	if (service === 'instagram') file = '/img/'+service+'-logo.png';
	if (service === 'sogive') {
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
	if (unitImpact && unitImpact.number && unitImpact.name && unitImpact.price) {
		const impactPerUnitMoney = unitImpact.number / unitImpact.price.value;
		return (
			<div>
				<strong><Misc.Money amount={amount} /></strong> will fund <strong>{printer.prettyNumber(impactPerUnitMoney * amount, 2)}</strong> {unitImpact.name}
			</div>
		);
	}
	return null;
};

export default Misc;
