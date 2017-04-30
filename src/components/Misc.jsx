import React from 'react';
import ReactDOM from 'react-dom';

import {FormControl,Checkbox,Textarea} from 'react-bootstrap';
import DataStore from '../plumbing/DataStore';

import {assert} from 'sjtest';
import _ from 'lodash';
import Enum from 'easy-enums';
import printer from '../utils/printer.js';
import C from '../C.js';


const Misc = {};

/**
E.g. "Loading your settings...""
*/
Misc.Loading = ({text}) => (
	<div>
		<span className="glyphicon glyphicon-cd spinning" /> Loading {text || ''}...
	</div>
);

Misc.Col2 = ({children}) => (<div className='container'>
	<div className='row'>
		<div className='col-md-6 col-sm-6'>{children[0]}</div><div className='col-md-6 col-sm-6'>{children[1]}</div>
	</div>
	</div>);

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
 * null is also accepted.
 */
Misc.Time = ({time}) => {
	if ( ! time) return null;
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
	if (service==='twitter') {
		return <Misc.Icon fa="twitter-square" size="4x"/>;
	}
	if (service==='facebook') {
		return <Misc.Icon fa="facebook-square" size="4x"/>;
	}
	let klass = "img-rounded logo";
	if (size) klass += " logo-"+size;
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

/**
 * Font-Awesome icons
 */
Misc.Icon = ({fa, size}) => {
	return <i className={'fa fa-'+fa + (size? ' fa-'+size : '')} aria-hidden="true"></i>;
};

// deprecated 
Misc.Checkbox = ({on, label, onChange}) => (
	<div className="checkbox">
		<label>
			<input onChange={onChange} type="checkbox" checked={on || false} /> {label}
		</label>
	</div>
);


Misc.ImpactDesc = ({unitImpact, amount}) => {
	if (unitImpact && unitImpact.number && unitImpact.price) {
		// more people?
		let peepText = '';
		let peeps = 1;
		if (unitImpact.number*amount < 0.5) {
			peeps = 1 / (unitImpact.number * amount);
			peepText = printer.prettyNumber(peeps, 1)+' people donating ';
		}
		const impactPerUnitMoney = unitImpact.number / unitImpact.price.value;
		// NB long line as easiest way to do spaces in React
		return (
			<div className='impact'>
				<p className='impact-text'>
					<span><b>{peepText}<Misc.Money amount={amount} /></b></span>
					<span> will fund</span>
					<span className="impact-units-amount"> {printer.prettyNumber(impactPerUnitMoney * amount * peeps, 2)}</span>					
					<span className='impact-unit-name'> {unitImpact.name || ''}</span>
				</p>
			</div>
		);
	}
	return null;
};

/**
 * label {?String}
 * dflt {?Object} default value
 */
Misc.PropControl = ({label, prop, path, item, type, bg, dflt, saveFn}) => {
	assert( ! type || Misc.ControlTypes.has(type), type);
	if (label) {
		return (<div className="form-group">
			<label>{label}</label>
			<Misc.PropControl dflt={dflt} prop={prop} path={path} item={item} type={type} bg={bg} />
		</div>);
	}
	if ( ! item) item = {};
	let value = item[prop]===undefined? dflt : item[prop];
	const proppath = path.slice().concat(prop);
	let debouncedSaveFn = saveFn? _.debounce(saveFn, 1000) : null;
	if (Misc.ControlTypes.ischeckbox(type)) {
		const onChange = e => {
			DataStore.setValue(proppath, e.target.checked);
			if (debouncedSaveFn) debouncedSaveFn({path:path});		
		};
		return (<Checkbox checked={item[prop]} onChange={onChange} />);
	}
	if (value===undefined) value = '';
	if (type==='MonetaryAmount') {
		// special case to handle x100 no-floats format
		let v100 = (item[prop] && item[prop].value100) || 0;
		let path2 = path.slice().concat([prop, 'value100']);
		// TODO saveFn
		return <FormControl name={prop} value={v100} onChange={e => DataStore.setValue(path2, e.target.value)} />;
	}
	const onChange = e => {
		DataStore.setValue(proppath, e.target.value);
		if (debouncedSaveFn) debouncedSaveFn({path:path});		
	};
	if (type==='textarea') {
		return <FormControl componentClass="textarea" name={prop} value={value} onChange={onChange} />;
	}
	if (type==='img') {
		return (<div>
			<FormControl type='url' name={prop} value={value} onChange={onChange} />
			<div className='pull-right' style={{background: bg, padding:bg?'20px':'0'}}><Misc.ImgThumbnail url={value} /></div>
			<div className='clearfix' />
		</div>);
	}
	if (type==='url') {
		return (<div>
			<FormControl type='url' name={prop} value={value} onChange={onChange} />
			<div className='pull-right'><Misc.SiteThumbnail url={value} /></div>
			<div className='clearfix' />
		</div>);
	}
	// normal
	// NB: type=color should produce a colour picker :)
	return <FormControl type={type} name={prop} value={value} onChange={onChange} />;
};
Misc.ControlTypes = new Enum("img textarea text password email url color MonetaryAmount checkbox");

Misc.SiteThumbnail = ({url}) => url? <a href={url} target='_blank'><iframe style={{width:'150px',height:'100px'}} src={url} /></a> : null;

Misc.ImgThumbnail = ({url}) => url? <img className='logo' src={url} /> : null;

export default Misc;
