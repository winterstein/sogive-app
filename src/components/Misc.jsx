import React from 'react';
import ReactDOM from 'react-dom';

import {FormControl,Checkbox,Textarea, InputGroup} from 'react-bootstrap';
import DataStore from '../plumbing/DataStore';

import {assert} from 'sjtest';
import _ from 'lodash';
import Enum from 'easy-enums';
import printer from '../utils/printer.js';
import C from '../C.js';
import I18n from 'easyi18n';

const Misc = {};

/**
E.g. "Loading your settings...""
*/
Misc.Loading = ({text}) => (
	<div>
		<span className="glyphicon glyphicon-cog spinning" /> Loading {text || ''}...
	</div>
);

Misc.Col2 = ({children}) => (<div className='container-fluid'>
	<div className='row'>
		<div className='col-md-6 col-sm-6'>{children[0]}</div><div className='col-md-6 col-sm-6'>{children[1]}</div>
	</div>
	</div>);

const CURRENCY = {
	GBP: "£",
	USD: "$"
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
		let impactNum = impactPerUnitMoney * amount * peeps;
		let unitName = unitImpact.name || '';
		// pluralise
		unitName = trPlural(impactNum, unitName);
		// NB long line as easiest way to do spaces in React
		return (
			<div className='impact'>
				<p className='impact-text'>
					<span><b>{peepText}<Misc.Money amount={amount} /></b></span>
					<span> will fund</span>
					<span className="impact-units-amount"> {printer.prettyNumber(impactNum, 2)}</span>					
					<span className='impact-unit-name'> {unitName}</span>
				</p>
			</div>
		);
	}
	return null;
};

/**
 * Copy pasta from I18N.js (aka easyi18n)
 * @param {number} num 
 * @param {String} text 
 */
const trPlural = (num, text) => {
	let isPlural = Math.round(num) !== 1;
	// Plural forms: 
	// Normal: +s, +es (eg potatoes, boxes), y->ies (eg parties), +en (e.g. oxen)
	// See http://www.englisch-hilfen.de/en/grammar/plural.htm, or https://en.wikipedia.org/wiki/English_plurals for the full horror.
	// We also cover some French, German (+e, +n) and Spanish.
	// regex matches letter(es)	
	if (isPlural===true) {
		// Get the correction from the translation
		text = text.replace(/(\w)\((s|es|en|e|n)\)/g, '$1$2');
		// Inline complex form: e.g. "child (plural: children)" or "children (sing: child)"
		// NB: The OED has pl, sing as abbreviations, c.f. http://public.oed.com/how-to-use-the-oed/abbreviations/
		text = text.replace(/(\w+)\s*\((plural|pl): ?(\w+)\)/g, '$3');
		text = text.replace(/(\w+)\s*\((singular|sing): ?(\w+)\)/g, '$1');
	} else if (isPlural===false) {
		text = text.replace(/(\w)\((s|es|en|e|n)\)/g, '$1');
		// Inline complex form
		text = text.replace(/(\w+)\s*\((plural|pl): ?(\w+)\)/g, '$1');
		text = text.replace(/(\w+)\s*\((singular|sing): ?(\w+)\)/g, '$3');
	}
	return text;
};


/**
 * @param saveFn {Function} You are advised to wrap this with e.g. _.debounce(myfn, 500).
 * NB: we cant debounce here, cos it'd be a different debounce fn each time.
 * label {?String}
 * dflt {?Object} default value
 */
Misc.PropControl = ({label, ...stuff}) => {
	// label? show it and recurse
	if (label) {
		return (<div className="form-group">
			<label>{label}</label>
			<Misc.PropControl {...stuff} />
		</div>);
	}	
	let {prop, path, item, type, bg, dflt, saveFn} = stuff;
	assert( ! type || Misc.ControlTypes.has(type), type);
	if ( ! item) item = {};
	let value = item[prop]===undefined? dflt : item[prop];
	const proppath = path.slice().concat(prop);
	if (Misc.ControlTypes.ischeckbox(type)) {
		const onChange = e => {
			// console.log("onchange", e); // minor TODO DataStore.onchange recognise and handle events
			DataStore.setValue(proppath, e.target.checked);
			if (saveFn) saveFn({path:path});		
		};
		if (value===undefined) value = false;
		return (<Checkbox checked={value} onChange={onChange} />);
	}
	if (value===undefined) value = '';
	if (type==='MonetaryAmount') {
		// special case, as this is an object.
		// NB: leave the x100 no-floats format for the backend
		let v = (value && value.value) || '';
		let path2 = path.slice().concat([prop, 'value']);
		const onChange = e => {
			DataStore.setValue(path2, e.target.value);
			if (saveFn) saveFn({path:path});
		};
		let curr = CURRENCY[value && value.currency] || <span>&pound;</span>;
		return (<InputGroup>
					<InputGroup.Addon>{curr}</InputGroup.Addon>              
					<FormControl name={prop} value={v} onChange={onChange} />
				</InputGroup>);
	}
	const onChange = e => {
		DataStore.setValue(proppath, e.target.value);
		if (saveFn) saveFn({path:path});		
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
	// date: dates that don't fit the mold yyyy-MM-dd get ignored!!
	if (type==='date' && value && ! value.match(/dddd-dd-dd/)) {
		let date = new Date(value);
		let nvalue = date.getUTCFullYear()+'-'+oh(date.getUTCMonth())+'-'+oh(date.getUTCDate());
		value = nvalue;
	}
	// normal
	// NB: type=color should produce a colour picker :)
	return <FormControl type={type} name={prop} value={value} onChange={onChange} />;
};

const oh = (n) => n<10? '0'+n : n;

Misc.ControlTypes = new Enum("img textarea text password email url color MonetaryAmount checkbox location date year");

Misc.SiteThumbnail = ({url}) => url? <a href={url} target='_blank'><iframe style={{width:'150px',height:'100px'}} src={url} /></a> : null;

Misc.ImgThumbnail = ({url}) => url? <img className='logo' src={url} /> : null;

export default Misc;
