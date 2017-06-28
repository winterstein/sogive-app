import React from 'react';
import ReactDOM from 'react-dom';

// FormControl
import {Textarea, InputGroup, DropdownButton, MenuItem} from 'react-bootstrap';
import DataStore from '../plumbing/DataStore';

import {assert, assMatch} from 'sjtest';
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
	if (service==='twitter' || service==='facebook') {
		return <Misc.Icon fa={service+"-square"} size={size==='small'? '2x' : '4x'} />;
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
Misc.Icon = ({fa, size, ...other}) => {
	return <i className={'fa fa-'+fa + (size? ' fa-'+size : '')} aria-hidden="true" {...other}></i>;
};


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
 * Input bound to DataStore
 * 
 * @param saveFn {Function} You are advised to wrap this with e.g. _.debounce(myfn, 500).
 * NB: we cant debounce here, cos it'd be a different debounce fn each time.
 * label {?String}
 * @param path {String[]} The DataStore path to item, e.g. [data, Charity, id]
 * @param item The item being edited. Can be null, and it will be fetched by path.
 * @param prop The field being edited 
 * dflt {?Object} default value
 */
Misc.PropControl = ({type, label, help, ...stuff}) => {
	// label / help? show it and recurse
	// NB: Checkbox has a different html layout :( -- handled below
	if ((label || help) && ! Misc.ControlTypes.ischeckbox(type)) {
		// Minor TODO help block id and aria-described-by property in the input
		return (<div className="form-group">
			{label? <label>{label}</label> : null}
			<Misc.PropControl type={type} {...stuff} />
			{help? <span className="help-block">{help}</span> : null}
		</div>);
	}
	let {prop, path, item, bg, dflt, saveFn, modelValueFromInput, ...otherStuff} = stuff;
	if ( ! modelValueFromInput) modelValueFromInput = standardModelValueFromInput;
	assert( ! type || Misc.ControlTypes.has(type), type);
	assert(_.isArray(path), path);
	// // item ought to match what's in DataStore - but this is too noisy when it doesn't
	// if (item && item !== DataStore.getValue(path)) {
	// 	console.warn("Misc.PropControl item != DataStore version", "path", path, "item", item);
	// }
	if ( ! item) {
		item = DataStore.getValue(path) || {};
	}
	let value = item[prop]===undefined? dflt : item[prop];
	const proppath = path.concat(prop);
	if (value===undefined) value = '';
	if (Misc.ControlTypes.ischeckbox(type)) {
		const onChange = e => {
			// console.log("onchange", e); // minor TODO DataStore.onchange recognise and handle events
			DataStore.setValue(proppath, e.target.checked);
			if (saveFn) saveFn({path:path});		
		};
		// make value boolean
		let on = value? true : false;
		return (<div className="checkbox">
			<label>
				<input onChange={onChange} type="checkbox" checked={on} {...otherStuff} /> {label}
			</label>
			{help? <span className="help-block">{help}</span> : null}
		</div>);
	} // ./checkbox
	// £s
	if (type==='MonetaryAmount') {
		// special case, as this is an object.
		// Which stores its value in two ways, straight and as a x100 no-floats format for the backend
		let v = '';
		if (value) v = value.value;
		if (v===undefined || v===null) {
			if (value.value100) v = value.value100/100;
			else v = '';
		}
		let path2 = path.concat([prop, 'value']);
		let path100 = path.concat([prop, 'value100']);
		const onChange = e => {
			let newVal = parseFloat(e.target.value);
			DataStore.setValue(path2, newVal);
			DataStore.setValue(path100, newVal*100);
			if (saveFn) saveFn({path:path});
		};
		let curr = CURRENCY[value && value.currency] || <span>&pound;</span>;
		let currency;
		let changeCurrency = otherStuff.changeCurrency || true;
		if (changeCurrency) {
			// TODO other currencies
			currency = (<DropdownButton title={curr} componentClass={InputGroup.Button} id={'input-dropdown-addon-'+JSON.stringify(path2)} >
          					<MenuItem key="1">{curr}</MenuItem>
			</DropdownButton>);
		} else {
			currency = <InputGroup.Addon>{curr}</InputGroup.Addon>;
		}
		assert(v === 0 || v || v==='', [v, value]);
		return (<InputGroup>
					{currency}
					<FormControl name={prop} value={v} onChange={onChange} {...otherStuff} />
				</InputGroup>);
	}
	// text based
	const onChange = e => {
		let mv = modelValueFromInput(e.target.value, type);
		DataStore.setValue(proppath, mv);
		if (saveFn) saveFn({path:path});
	};
	if (type==='textarea') {
		return <textarea className="form-control" name={prop} onChange={onChange} {...otherStuff} value={value} />;
	}
	if (type==='img') {
		return (<div>
			<FormControl type='url' name={prop} value={value} onChange={onChange} {...otherStuff} />
			<div className='pull-right' style={{background: bg, padding:bg?'20px':'0'}}><Misc.ImgThumbnail url={value} /></div>
			<div className='clearfix' />
		</div>);
	}
	if (type==='url') {
		return (<div>
			<FormControl type='url' name={prop} value={value} onChange={onChange} {...otherStuff} />
			<div className='pull-right'><small>{value? <a href={value} target='_blank'>open in a new tab</a> : null}</small></div>
			<div className='clearfix' />
		</div>);
	}
	// date
	// NB dates that don't fit the mold yyyy-MM-dd get ignored by the date editor. But we stopped using that
	//  && value && ! value.match(/dddd-dd-dd/)
	if (type==='date') {		
		// Full ISO 8601? e.g. from a backend Date. Then chop the time part e.g. "2017-06-26T15:55:43.284Z" -> "2017-06-26"
		if (typeof(value) === 'string' && value.match(/\d{4}-\d\d-\d\dT\d{2}:\d{2}.+/)) {
			value = value.substr(0, 10);
		}
		// NB: parsing incomplete dates causes NaNs
		let datePreview = value? 'not a valid date' : null;
		try {
			let date = new Date(value);
			datePreview = date.toLocaleDateString();
		} catch (er) {
			// bad date
		}
		// let's just use a text entry box -- c.f. bugs reported https://github.com/winterstein/sogive-app/issues/71 & 72
		// Encourage ISO8601 format
		if ( ! otherStuff.placeholder) otherStuff.placeholder = 'yyyy-mm-dd, e.g. today is '+isoDate(new Date());
		return (<div>
			<FormControl type='text' name={prop} value={value} onChange={onChange} {...otherStuff} />
			<div className='pull-right'><i>{datePreview}</i></div>
			<div className='clearfix' />
		</div>);
	}
	if (type==='select') {
		let options = otherStuff.options;
		delete otherStuff.options;
		let domOptions = options.map(option => <option value={option} selected={option == value}>{option}</option>);
		return (<select className='form-control' name={prop} onChange={onChange} {...otherStuff} >
				{domOptions}
			</select>);
	}
	// normal
	// NB: type=color should produce a colour picker :)
	return <FormControl type={type} name={prop} value={value} onChange={onChange} {...otherStuff} />;
};

Misc.ControlTypes = new Enum("img textarea text select password email url color MonetaryAmount checkbox location date year number");

/**
 * Convert inputs (probably text) into the model's format (e.g. numerical)
 */
const standardModelValueFromInput = (inputValue, type) => {
	if ( ! inputValue) return inputValue;
	// numerical?
	if (type==='year') {
		return parseInt(inputValue);
	}
	if (type==='number') {
		return parseFloat(inputValue);
	}
	return inputValue;
};

const oh = (n) => n<10? '0'+n : n;
/**
 * @param d {Date}
 * @returns {String}
 */
const isoDate = (d) => d.toISOString().replace(/T.+/, '');

// Misc.SiteThumbnail = ({url}) => url? <a href={url} target='_blank'><iframe style={{width:'150px',height:'100px'}} src={url} /></a> : null;

Misc.ImgThumbnail = ({url}) => url? <img className='logo' style={{maxWidth:'100%'}} src={url} /> : null;

/**
 * This replaces the react-bootstrap version 'cos we saw odd bugs there. 
 * Plus since we're providing state handling, we don't need a full component.
 */
const FormControl = (props) => {
	return <input className='form-control' {...props} />;
};


export default Misc;
// // TODO rejig for export {
// 	PropControl: Misc.PropControl
// };
