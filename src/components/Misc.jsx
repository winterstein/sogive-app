import React from 'react';

// FormControl removed in favour of basic <inputs> while debugging input lag
import { Checkbox, InputGroup, DropdownButton, MenuItem} from 'react-bootstrap';


import {assert, assMatch} from 'sjtest';
import _ from 'lodash';
import Enum from 'easy-enums';
import {setHash} from 'wwutils';
import PV from 'promise-value';

import DataStore from '../plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import ServerIO from '../plumbing/ServerIO';
import printer from '../utils/printer';
import C from '../C';
import MonetaryAmount from '../data/charity/MonetaryAmount';
import Autocomplete from 'react-autocomplete';
// import I18n from 'easyi18n';
import {getType, getId} from '../data/DataClass';

const Misc = {};

/**
E.g. "Loading your settings...""
*/
Misc.Loading = ({text}) => (
	<div>
		<span className="glyphicon glyphicon-cog spinning" /> Loading {text || ''}...
	</div>
);

Misc.Col2 = ({children}) => (
	<div className='container-fluid'>
		<div className='row'>
			<div className='col-md-6 col-sm-6'>{children[0]}</div><div className='col-md-6 col-sm-6'>{children[1]}</div>
		</div>
	</div>
);

const CURRENCY = {
	GBP: "£",
	USD: "$"
};
/**
 * Money span, falsy displays as 0
 * @param amount {MonetaryAmount|Number}
 */
Misc.Money = ({amount, precision}) => {
	if (_.isNumber(amount) || _.isString(amount)) {
		amount = {value: amount, currency:'GBP'};
	}
	if ( ! amount) amount = {value: 0};
	let snum = printer.prettyNumber(amount.value, precision);
	// remove .0
	if (snum.substr(snum.length-2, snum) === '.0') snum = snum.substr(0, snum.length-2);
	// pad .1 to .10
	if (snum.match(/\.\d$/)) snum += '0';
	return (
		<span className='money'>
			<span className='currency-symbol'>{CURRENCY[amount.currency || 'GBP']}</span>
			<span className='amount'>{snum}</span>
		</span>
	);
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
	assert(service, 'Misc.Logo');
	if (service==='twitter' || service==='facebook'|| service==='instagram') {
		return <span className={'color-'+service}><Misc.Icon fa={service+"-square"} size={size==='small'? '2x' : '4x'} /></span>;
	}
	let klass = "img-rounded logo";
	if (size) klass += " logo-"+size;
	let file = '/img/'+service+'-logo.svg';
	if (service === 'instagram') file = '/img/'+service+'-logo.png';
	if (service === C.app.service) {
		file = C.app.logo;
		if (transparent === false) file = '/img/SoGive-Light-70px.png';
	}
	return (
		<img alt={service} data-pin-nopin="true" className={klass} src={file} />
	);
}; // ./Logo

/**
 * Font-Awesome or Glyphicon icons
 */
Misc.Icon = ({glyph, fa, size, className, ...other}) => {	
	if (glyph) {
		return (<span className={'glyphicon glyphicon-'+glyph
								+ (size? ' fa-'+size : '')
								+ (className? ' '+className : '')} 
					aria-hidden="true" {...other} />);
	}
	return (<i className={'fa fa-'+fa + (size? ' fa-'+size : '') + (className? ' '+className : '') } 
				aria-hidden="true" {...other} />);
};


/**
 * Input bound to DataStore
 * 
 * @param saveFn {Function} {path, value} You are advised to wrap this with e.g. _.debounce(myfn, 500).
 * NB: we cant debounce here, cos it'd be a different debounce fn each time.
 * label {?String}
 * @param path {String[]} The DataStore path to item, e.g. [data, NGO, id]
 * @param item The item being edited. Can be null, and it will be fetched by path.
 * @param prop The field being edited 
 * dflt {?Object} default value
 */
Misc.PropControl = ({type="text", label, help, ...stuff}) => {
	// label / help? show it and recurse
	// NB: Checkbox has a different html layout :( -- handled below
	if ((label || help) && ! Misc.ControlTypes.ischeckbox(type)) {
		// Minor TODO help block id and aria-described-by property in the input
		const labelText = label || '';
		const helpIcon = help ? <Misc.Icon glyph='question-sign' title={help} /> : '';
		// The label and PropControl are on the same line to preserve the whitespace in between for inline forms
		return (
			<div className='form-group'>
				<label htmlFor={stuff.name}>{labelText} {helpIcon}</label> <Misc.PropControl type={type} {...stuff} />
			</div>
		);
	}
	let {prop, path, item, bg, dflt, saveFn, modelValueFromInput, ...otherStuff} = stuff;
	if ( ! modelValueFromInput) modelValueFromInput = standardModelValueFromInput;
	assert( ! type || Misc.ControlTypes.has(type), 'Misc.PropControl: '+type);
	assert(_.isArray(path), 'Misc.PropControl: not an array:'+path);
	assert(path.indexOf(null)===-1 && path.indexOf(undefined)===-1, 'Misc.PropControl: null in path '+path);
	// // item ought to match what's in DataStore - but this is too noisy when it doesn't
	// if (item && item !== DataStore.getValue(path)) {
	// 	console.warn("Misc.PropControl item != DataStore version", "path", path, "item", item);
	// }
	if ( ! item) {
		item = DataStore.getValue(path) || {};
	}
	let value = item[prop]===undefined? dflt : item[prop];
	const proppath = path.concat(prop);
	// Checkbox?
	if (Misc.ControlTypes.ischeckbox(type)) {
		const onChange = e => {
			// console.log("onchange", e); // minor TODO DataStore.onchange recognise and handle events
			DataStore.setValue(proppath, e.target.checked);
			if (saveFn) saveFn({path:path, value:e.target && e.target.checked});		
		};
		if (value===undefined) value = false;
		return (<Checkbox checked={value} onChange={onChange} {...otherStuff}>{label}</Checkbox>);
	}
	if (value===undefined) value = '';
	// £s
	// NB: This is a bit awkward code -- is there a way to factor it out nicely?? The raw vs parsed/object form annoyance feels like it could be a common case.
	if (type==='MonetaryAmount') {
		let acprops ={prop, value, path, proppath, item, bg, dflt, saveFn, modelValueFromInput, ...otherStuff};
		return <PropControlMonetaryAmount {...acprops} />;
	} // ./£
	// text based
	const onChange = e => {
		console.log("event", e, e.type);
		// TODO a debounced property for "do ajax stuff" to hook into. HACK blur = do ajax stuff
		DataStore.setValue(['transient', 'doFetch'], e.type==='blur');	
		let mv = modelValueFromInput(e.target.value, type, e.type);
		DataStore.setValue(proppath, mv);
		if (saveFn) saveFn({path:path, value:mv});
		e.preventDefault();
		e.stopPropagation();
	};
	if (type === 'arraytext') {
		// Pretty hacky: Value stored as ["one", "two", "three"] but displayed as "one two three"
		// Currently used for entering list of unit-variants for publisher
		const arrayChange = e => {
			const oldString = DataStore.getValue(proppath);
			const newString = e.target.value;

			// Split into space-separated tokens
			let newValue = newString.split(' ');
			// Remove falsy entries, if deleting (ie newString is substring of oldString) but not if adding
			// allows us to go 'one' (['one']) -> "one " ('one', '') -> "one two" ('one', 'two')
			if (oldString.indexOf(newString) >= 0) {
				newValue = newValue.filter(val => val);
			}
			
			DataStore.setValue(proppath, newValue);
			if (saveFn) saveFn({path});
			e.preventDefault();
			e.stopPropagation();
		};
		return <FormControl type={type} name={prop} value={value.join(' ')} onChange={arrayChange} {...otherStuff} />;
	}
	if (type==='textarea') {
		return <textarea className="form-control" name={prop} onChange={onChange} {...otherStuff} value={value} />;
	}
	if (type==='json') {
		let spath = ['transient'].concat(proppath);
		let svalue = DataStore.getValue(spath) || JSON.stringify(value);
		const onJsonChange = e => {
			console.log("event", e.target && e.target.value, e, e.type);
			DataStore.setValue(spath, e.target.value);
			try {				
				let vnew = JSON.parse(e.target.value);
				DataStore.setValue(proppath, vnew);
				if (saveFn) saveFn({path:path});
			} catch(err) {
				console.warn(err);
				// TODO show error feedback
			}			
			e.preventDefault();
			e.stopPropagation();
		};
		return <textarea className="form-control" name={prop} onChange={onJsonChange} {...otherStuff} value={svalue} />;
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
			<FormControl type='url' name={prop} value={value} onChange={onChange} onBlur={onChange} {...otherStuff} />
			<div className='pull-right'><small>{value? <a href={value} target='_blank'>open in a new tab</a> : null}</small></div>
			<div className='clearfix' />
		</div>);
	}
	// date
	// NB dates that don't fit the mold yyyy-MM-dd get ignored by the date editor. But we stopped using that
	//  && value && ! value.match(/dddd-dd-dd/)
	if (type==='date') {
		// parsing incomplete dates causes NaNs
		// let date = new Date(value);
		// let nvalue = date.getUTCFullYear()+'-'+oh(date.getUTCMonth())+'-'+oh(date.getUTCDate());
		// value = nvalue;
		let datePreview = value? 'not a valid date' : null;
		try {
			let date = new Date(value);
			datePreview = date.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});
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
		const options = otherStuff.options;
		const defaultValue = otherStuff.defaultValue;
		delete otherStuff.options;
		delete otherStuff.defaultValue;

		assert(options, 'Misc.PropControl: no options for select '+[prop, otherStuff]);
		assert(options.map, 'Misc.PropControl: options not an array '+options);
		// Make an option -> nice label function
		// the labels prop can be a map or a function
		let labels = otherStuff.labels;
		delete otherStuff.labels;		
		let labeller = v => v;
		if (labels) {
			labeller = _.isFunction(labels)? labels : v => labels[v] || v;
		}
		// make the options html
		let domOptions = options.map(option => <option key={"option_"+option} value={option} >{labeller(option)}</option>);
		let sv = value || defaultValue;
		return (
			<select className='form-control' name={prop} value={sv} onChange={onChange} {...otherStuff} >
				{sv? null : <option></option>}
				{domOptions}
			</select>
		);
	}
	if (type==='autocomplete') {
		let acprops ={prop, value, path, proppath, item, bg, dflt, saveFn, modelValueFromInput, ...otherStuff};
		return <PropControlAutocomplete {...acprops} />;
	}
	// normal
	// NB: type=color should produce a colour picker :)
	return <FormControl type={type} name={prop} value={value} onChange={onChange} {...otherStuff} />;
}; //./PropControl

Misc.ControlTypes = new Enum("img textarea text select autocomplete password email url color MonetaryAmount checkbox"
							+" location date year number arraytext address postcode json");


const PropControlMonetaryAmount = ({prop, value, path, proppath, 
									item, bg, dflt, saveFn, modelValueFromInput, ...otherStuff}) => {
		// special case, as this is an object.
	// Which stores its value in two ways, straight and as a x100 no-floats format for the backend
	// Convert null and numbers into MA objects
	if ( ! value || _.isString(value) || _.isNumber(value)) {
		value = MonetaryAmount.make({value});
	}
	// prefer raw, so users can type incomplete answers!
	let v = value.raw || value.value;
	if (v===undefined || v===null || _.isNaN(v)) { // allow 0, which is falsy
		v = '';
	}
	//MonetaryAmount.assIsa(value); // type can be blank
	// handle edits
	const onMoneyChange = e => {
		let newVal = parseFloat(e.target.value);
		value.raw = e.target.value;
		value.value = newVal;
		DataStore.setValue(proppath, value, true); // force update 'cos editing the object makes this look like a no-op
		// console.warn("£", value, proppath);
		if (saveFn) saveFn({path, value});
	};
	let curr = CURRENCY[value && value.currency] || <span>&pound;</span>;
	let currency;
	let changeCurrency = otherStuff.changeCurrency !== false;
	if (changeCurrency) {
		// TODO other currencies
		currency = (
			<DropdownButton disabled={otherStuff.disabled} title={curr} componentClass={InputGroup.Button} id={'input-dropdown-addon-'+JSON.stringify(proppath)}>
				<MenuItem key="1">{curr}</MenuItem>
			</DropdownButton>
		);
	} else {
		currency = <InputGroup.Addon>{curr}</InputGroup.Addon>;
	}
	delete otherStuff.changeCurrency;
	assert(v === 0 || v || v==='', [v, value]);
	// make sure all characters are visible
	let minWidth = ((""+v).length / 1.5)+"em";
	return (<InputGroup>
		{currency}
		<FormControl name={prop} value={v} onChange={onMoneyChange} {...otherStuff} style={{minWidth}}/>
	</InputGroup>);
}; // ./£


const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const YEAR = 365 * DAY;

Misc.RelativeDate = ({date, ...rest}) => {
	const dateObj = new Date(date);
	const now = new Date();

	let diff = now.getTime() - dateObj.getTime();
	let relation = diff > 0 ? 'ago' : 'in the future';
	diff = Math.abs(diff);
	const absoluteDate = dateObj.toLocaleString('en-GB');
	let count = 'less than one';
	let counter = 'second';

	const calcCount = (divisor) => Math.round(diff / divisor);

	if (diff > YEAR) {
		count = calcCount(YEAR);
		counter = 'year';
	} else if (diff > 4 * WEEK) {
		// months is fiddly, so let Date handle it
		count = (now.getMonth() - dateObj.getMonth()) + (12 * (now.getYear() - dateObj.getYear()));
		counter = 'month';	
	} else if (diff > WEEK) {
		count = calcCount(WEEK);
		counter = 'week';
	} else if (diff > DAY) {
		count = calcCount(DAY);
		counter = 'day';
	} else if (diff > HOUR) {
		count = calcCount(HOUR);
		counter = 'hour';
	} else if (diff > MINUTE) {
		count = calcCount(MINUTE);
		counter = 'minute';
	} else if (diff > SECOND) {
		count = calcCount(SECOND);
		counter = 'second';
	}

	if (count > 1) {
		counter += 's';
	}

	return <span title={absoluteDate} {...rest}>{count} {counter} {relation}</span>;
};


/**
 * wraps the reactjs autocomplete widget
 */
const PropControlAutocomplete = ({prop, value, options, getItemValue, renderItem, path, proppath, 
									item, bg, dflt, saveFn, modelValueFromInput, ...otherStuff}) => {
	// a place to store the working state of this widget
	let widgetPath = ['widget', 'autocomplete'].concat(path);
	if ( ! getItemValue) getItemValue = s => s;
	if ( ! renderItem) renderItem = a => printer.str(a);
	const type='autocomplete';
	let items = _.isArray(options)? options : DataStore.getValue(widgetPath) || [];
	// NB: typing sends e = an event, clicking an autocomplete sends e = a value
	const onChange2 = (e, optItem) => {
		console.log("event", e, e.type, optItem);
		// TODO a debounced property for "do ajax stuff" to hook into. HACK blur = do ajax stuff
		DataStore.setValue(['transient', 'doFetch'], e.type==='blur');	
		// typing sneds an event, clicking an autocomplete sends a value
		const val = e.target? e.target.value : e;
		let mv = modelValueFromInput(val, type, e.type);
		DataStore.setValue(proppath, mv);
		if (saveFn) saveFn({path:path, value:mv});
		// e.preventDefault();
		// e.stopPropagation();
	};
	const onChange = (e, optItem) => {
		onChange2(e, optItem);
		if ( ! e.target.value) return;
		if ( ! _.isFunction(options)) return;
		let optionsOutput = options(e.target.value);
		let pvo = PV(optionsOutput);
		pvo.promise.then(oo => {
			DataStore.setValue(widgetPath, oo);
			// also save the info in data
			oo.forEach(opt => getType(opt) && getId(opt)? DataStore.setValue(['data',getType(opt), getId(opt)], opt) : null);
		});
		// NB: no action on fail - the user just doesn't get autocomplete		
	};

	return (<Autocomplete 
		inputProps={{className: otherStuff.className || 'form-control'}}
		getItemValue={getItemValue}
		items={items}
		renderItem={renderItem}
		value={value}
		onChange={onChange}
		onSelect={onChange2} 
  />);
}; //./autocomplete

/**
 * A button which sets a DataStore address to a specific value
 * 
 * e.g.
 * <SetButton path={['widget','page']} value='2'>Next</SetButton>
 * is roughly equivalent to
 * <div onClick={() => DataStore.setValue(['widget','page'], 2)}>Next</div>
 * 
 * ??maybe phase this out in favour of just the direct use?? ^DW
 */
Misc.SetButton = ({path, value, children, className}) => {
	assert(path && path.length);
	const doSet = () => {
		DataStore.setValue(path, value);
	};
	return <span className={className} onClick={doSet}>{children}</span>;
};


/**
 * Convert inputs (probably text) into the model's format (e.g. numerical)
 * @param eventType "change"|"blur" More aggressive edits should only be done on "blur"
 */
const standardModelValueFromInput = (inputValue, type, eventType) => {
	if ( ! inputValue) return inputValue;
	// numerical?
	if (type==='year') {
		return parseInt(inputValue);
	}
	if (type==='number') {
		return parseFloat(inputValue);
	}
	// add in https:// if missing
	if (type==='url' && eventType==='blur') {
		if (inputValue.indexOf('://') === -1 && inputValue[0] !== '/' && 'http'.substr(0, inputValue.length) !== inputValue.substr(0,4)) {
			inputValue = 'https://'+inputValue;
		}
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
const FormControl = ({value, ...otherProps}) => {
	if (value===null || value===undefined) value = '';
	return <input className='form-control' value={value} {...otherProps} />;
};

/** Hack: a debounced auto-save function for the save/publish widget */
const saveDraftFn = _.debounce(
	({type, id}) => {
		ActionMan.saveEdits(type, id);
		return true;
	}, 5000);


/**
 * Just a convenience for a Bootstrap panel
 */
Misc.Card = ({title, glyph, icon, children, titleChildren, ...props}) => {
	return (
		<div className="panel panel-default" {...props}>
			<div className="panel-heading">
				<h3 className="panel-title">{icon? <Misc.Icon glyph={glyph} fa={icon} /> : null} {title || ''}</h3>
				{ titleChildren }
			</div>
			<div className="panel-body">
				{children}
			</div>
		</div>
	);
};

// /** replaced by ListLoad
//  * on click, set the hash to #hash
//  * The child elements is what gets displayed inside an a tag (so the user could control-click or save the link)
//  * Use-case: for making navigation links & buttons where we use deep-linking urls.
//  */
// Misc.RestItem = ({hash, children}) => {
// 	assert(hash, 'Misc.RestItem');
// 	const clicked = e => { setHash(hash); e.preventDefault(); e.stopPropagation(); };
// 	return (<a className='RestItem' href={'#'+hash} onClick={clicked} >
// 			{children}
// 		</a>);
// };

/**
 * save buttons
 * TODO auto-save on edit -- copy from sogive
 */
Misc.SavePublishDiscard = ({type, id, hidden }) => {
	assert(C.TYPES.has(type), 'Misc.SavePublishDiscard');
	assMatch(id, String);
	let localStatus = DataStore.getLocalEditsStatus(type, id);
	let isSaving = C.STATUS.issaving(localStatus);	
	let item = DataStore.getData(type, id);
	// request a save?
	if (C.STATUS.isdirty(localStatus) && ! isSaving) {
		saveDraftFn({type,id});
	}
	// if nothing has been edited, then we can't publish, save, or discard
	// NB: modified is a persistent marker, managed by the server, for draft != published
	let noEdits = item && C.KStatus.isPUBLISHED(item.status) && C.STATUS.isclean(localStatus) && ! item.modified;

	// Sometimes we just want to autosave drafts!
	if (hidden) return <span />;

	return (<div title={item && item.status}>
		<div><small>Status: {item && item.status}, Modified: {localStatus} {isSaving? "saving...":null}</small></div>
		<button className='btn btn-default' disabled={isSaving || C.STATUS.isclean(localStatus)} onClick={() => ActionMan.saveEdits(type, id)}>
			Save Edits {isSaving? <span className="glyphicon glyphicon-cd spinning" /> : <span>&nbsp;</span>}
		</button>
		&nbsp;
		<button className='btn btn-primary' disabled={isSaving || noEdits} onClick={() => ActionMan.publishEdits(type, id)}>
			Publish Edits {isSaving? <span className="glyphicon glyphicon-cd spinning" /> : <span>&nbsp;</span>}
		</button>
		&nbsp;
		<button className='btn btn-warning' disabled={isSaving || noEdits} onClick={() => ActionMan.discardEdits(type, id)}>
			Discard Edits {isSaving? <span className="glyphicon glyphicon-cd spinning" /> : <span>&nbsp;</span>}
		</button>
		&nbsp;
		<button className='btn btn-danger' disabled={isSaving} onClick={() => ActionMan.delete(type, id)} >
			Delete {isSaving? <span className="glyphicon glyphicon-cd spinning" /> : <span>&nbsp;</span>}
		</button>
	</div>);
};

export default Misc;
// // TODO rejig for export {
// 	PropControl: Misc.PropControl
// };
