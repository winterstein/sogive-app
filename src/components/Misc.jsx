import React from 'react';

// FormControl removed in favour of basic <inputs> while debugging input lag
import { Checkbox, Radio, FormGroup, InputGroup, DropdownButton, MenuItem} from 'react-bootstrap';


import {assert, assMatch} from 'sjtest';
import _ from 'lodash';
import Enum from 'easy-enums';
import { setHash, XId } from 'wwutils';
import PV from 'promise-value';
import Dropzone from 'react-dropzone';

import DataStore from '../plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import ServerIO from '../plumbing/ServerIO';
import printer from '../utils/printer';
import C from '../C';
import Money from '../data/charity/Money';
import Autocomplete from 'react-autocomplete';
// import I18n from 'easyi18n';
import {getType, getId, nonce} from '../data/DataClass';
import md5 from 'md5';
import Settings from '../Settings';

const Misc = {};

/**
E.g. "Loading your settings...""
See https://www.w3schools.com/howto/howto_css_loader.asp
http://tobiasahlin.com/spinkit/
*/
Misc.Loading = ({text}) => {
	return (<div className='loader-box'><center>	
		<div className="loader" />
		{text===undefined? 'Loading...' : text}
	</center>
	</div>);
	// <div>
	// 	<span className="glyphicon glyphicon-cog spinning" /> Loading {text || ''}...
	// </div>
};

/**
 * 
 * @param {
 * 	TODO?? noPadding: {Boolean} switch off Bootstrap's row padding.
 * }
 */
Misc.Col2 = ({children}) => (
	<div className='container-fluid'>
		<div className='row'>
			<div className='col-md-6 col-sm-6'>{children[0]}</div><div className='col-md-6 col-sm-6'>{children[1]}</div>
		</div>
	</div>
);

const CURRENCY = {
	gbp: "£",
	usd: "$"
};
/**
 * Money span, falsy displays as 0
 * 
 * @param amount {Money|Number}
 */
Misc.Money = ({amount, minimumFractionDigits, maximumFractionDigits=2, maximumSignificantDigits}) => {
	if ( ! amount) amount = 0;
	if (_.isNumber(amount) || _.isString(amount)) {
		amount = {value: amount, currency:'GBP'};
	}
	let value = amount? amount.value : 0;
	if (isNaN(value)) value = 0; // avoid ugly NaNs
	if (maximumFractionDigits===0) { // because if maximumSignificantDigits is also set, these two can conflict
		value = Math.round(value);
	}
	let snum = new Intl.NumberFormat(Settings.locale, 
		{maximumFractionDigits, minimumFractionDigits, maximumSignificantDigits}
	).format(value);
	// let snum;	
	// if ( ! precision) {
	// 	let sv2 = amount.value.toFixed(2);
	// 	snum = printer.prettyNumber2_commas(sv2);
	// } else {	
	// 	snum = printer.prettyNumber(amount.value, precision);
	// }
	if ( ! minimumFractionDigits) {
		// remove .0 and .00
		if (snum.substr(snum.length-2) === '.0') snum = snum.substr(0, snum.length-2);
		if (snum.substr(snum.length-3) === '.00') snum = snum.substr(0, snum.length-3);
	}
	// pad .1 to .10
	if (snum.match(/\.\d$/)) snum += '0';

	const currencyCode = (amount.currency || 'gbp').toLowerCase();
	return (
		<span className='money'>
			<span className='currency-symbol'>{CURRENCY[currencyCode]}</span>
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
Misc.Logo = ({service, size, transparent, bgcolor, color}) => {
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
 * @param saveFn {Function} {path, prop, item, value} You are advised to wrap this with e.g. _.debounce(myfn, 500).
 * NB: we cant debounce here, cos it'd be a different debounce fn each time.
 * label {?String}
 * @param path {String[]} The DataStore path to item, e.g. [data, NGO, id]
 * @param item The item being edited. Can be null, and it will be fetched by path.
 * @param prop The field being edited 
 * @param dflt {?Object} default value Beware! This may not get saved if the user never interacts.
 * @param modelValueFromInput {?Function} See standardModelValueFromInput
 * @param required {?Boolean} If set, this field should be filled in before a form submit. 
* 		TODO mark that somehow
* @param validator {?(value, rawValue) => String} Generate an error message if invalid
* @param https {?Boolean} if true, urls must use https not http (recommended)
 */
Misc.PropControl = ({type="text", path, prop, label, help, error, validator, recursing, ...stuff}) => {
	assMatch(prop, "String|Number");
	assMatch(path, Array);
	const proppath = path.concat(prop);

	// HACK: catch bad dates and make an error message
	// TODO generalise this with a validation function
	if (Misc.ControlTypes.isdate(type) && ! validator) {
		validator = (v, rawValue) => {
			if ( ! v) {
				// raw but no date suggests the server removed it
				if (rawValue) return 'Please use the date format yyyy-mm-dd';
				return null;
			}
			try {
				let sdate = "" + new Date(v);
				if (sdate === 'Invalid Date') {
					return 'Please use the date format yyyy-mm-dd';
				}
			} catch (er) {
				return 'Please use the date format yyyy-mm-dd';
			}
		};
	} // date
	// url: https
	if (stuff.https !== false && (Misc.ControlTypes.isurl(type) || Misc.ControlTypes.isimg(type) || Misc.ControlTypes.isimgUpload(type))
			&& ! validator)
	{
		validator = v => {
			if (v && v.substr(0,5) !== 'https') {
				return "Use https for secure urls";
			}
			return null;
		};
	}
	// validate!
	if (validator) {
		const value = DataStore.getValue(proppath);
		const rawPath = path.concat(prop+"_raw");
		const rawValue = DataStore.getValue(rawPath);
		error = validator(value, rawValue);
	}

	// label / help? show it and recurse
	// NB: Checkbox has a different html layout :( -- handled below
	if ((label || help || error) && ! Misc.ControlTypes.ischeckbox(type) && ! recursing) {
		// Minor TODO help block id and aria-described-by property in the input
		const labelText = label || '';
		const helpIcon = help ? <Misc.Icon glyph='question-sign' title={help} /> : '';
		// NB: The label and PropControl are on the same line to preserve the whitespace in between for inline forms.
		// NB: pass in recursing error to avoid an infinite loop with the date error handling above.
		return (
			<div className={'form-group' + (error? ' has-error' : '')}>
				<label htmlFor={stuff.name}>{labelText} {helpIcon}</label>
				<Misc.PropControl
					type={type} path={path} prop={prop} error={error} {...stuff} recursing 
				/>
				{error? <span className="help-block">{error}</span> : null}
			</div>
		);
	}

	// unpack
	let {item, bg, dflt, saveFn, modelValueFromInput, ...otherStuff} = stuff;
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

	// Checkbox?
	if (Misc.ControlTypes.ischeckbox(type)) {
		const onChange = e => {
			// console.log("onchange", e); // minor TODO DataStore.onchange recognise and handle events
			const val = e && e.target && e.target.checked;
			DataStore.setValue(proppath, val);
			if (saveFn) saveFn({path, prop, item, value: val});		
		};
		if (value===undefined) value = false;
		const helpIcon = help ? <Misc.Icon glyph='question-sign' title={help} /> : null;
		return (<div>
			<Checkbox checked={value} onChange={onChange} {...otherStuff}>{label} {helpIcon}</Checkbox>
			{error? <span className="help-block">{error}</span> : null}
		</div>);
	} // ./checkbox

	// HACK: Yes-no (or unset) radio buttons? (eg in the Gift Aid form)
	if (type === 'yesNo') {
		const onChange = e => {
			// console.log("onchange", e); // minor TODO DataStore.onchange recognise and handle events
			const val = e && e.target && e.target.value && e.target.value !== 'false';
			DataStore.setValue(proppath, val);
			if (saveFn) saveFn({path, prop, item, value: val});		
		};

		// Null/undefined doesn't mean "no"! Don't check either option until we have a value.
		const noChecked = value !== null && value !== undefined && !value;

		return (
			<div className='form-group'>
				<Radio value name={prop} onChange={onChange} checked={value} inline>Yes</Radio>
				<Radio value={false} name={prop} onChange={onChange} checked={noChecked} inline>No</Radio>
			</div>
		);
	}


	if (value===undefined) value = '';

	// £s
	// NB: This is a bit awkward code -- is there a way to factor it out nicely?? The raw vs parsed/object form annoyance feels like it could be a common case.
	if (type === 'Money') {
		let acprops = {prop, value, path, proppath, item, bg, dflt, saveFn, modelValueFromInput, ...otherStuff};
		return <PropControlMoney {...acprops} />;
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
		delete otherStuff.https;
		return (<div>
				<FormControl type='url' name={prop} value={value} onChange={onChange} {...otherStuff} />
			<div className='pull-right' style={{background: bg, padding:bg?'20px':'0'}}><Misc.ImgThumbnail url={value} style={{background:bg}} /></div>
				<div className='clearfix' />
			</div>);
	}

	if (type === 'imgUpload') {
		delete otherStuff.https;
		const uploadAccepted = (accepted, rejected) => {
			const progress = (event) => console.log('UPLOAD PROGRESS', event.loaded);
			const load = (event) => console.log('UPLOAD SUCCESS', event);
	
			accepted.forEach(file => {
				ServerIO.upload(file, progress, load)
					.done(response => {
						DataStore.setValue(path.concat(prop), response.cargo.url);
					});
			});
	
			rejected.forEach(file => {
				// TODO Inform the user that their file had a Problem
			});
		};

		return (
			<div>
				<FormControl type='url' name={prop} value={value} onChange={onChange} {...otherStuff} />
				<div className='pull-left'>
					<Dropzone
						className='DropZone'
						accept='image/jpeg, image/png'
						style={{}}
						onDrop={uploadAccepted}
					>
						Drop a JPG or PNG image here
					</Dropzone>
				</div>
				<div className='pull-right' style={{background: bg, padding:bg?'20px':'0'}}><Misc.ImgThumbnail style={{background: bg}} url={value} /></div>
				<div className='clearfix' />
			</div>
		);
	} // ./imgUpload

	if (type==='url') {
		delete otherStuff.https;
		return (<div>
			<FormControl type='url' name={prop} value={value} onChange={onChange} onBlur={onChange} {...otherStuff} />
			<div className='pull-right'><small>{value? <a href={value} target='_blank'>open in a new tab</a> : null}</small></div>
			<div className='clearfix' />
		</div>);
	}

	// date
	// NB dates that don't fit the mold yyyy-MM-dd get ignored by the date editor. But we stopped using that
	//  && value && ! value.match(/dddd-dd-dd/)
	if (Misc.ControlTypes.isdate(type)) {
		const acprops = {prop, item, value, onChange, ...otherStuff};
		return <PropControlDate {...acprops} />;
	}

	if (type==='select') {
		const { options, defaultValue, labels, ...rest} = otherStuff;

		assert(options, 'Misc.PropControl: no options for select '+[prop, otherStuff]);
		assert(options.map, 'Misc.PropControl: options not an array '+options);
		// Make an option -> nice label function
		// the labels prop can be a map or a function
		let labeller = v => v;
		if (labels) {
			labeller = _.isFunction(labels)? labels : v => labels[v] || v;
		}
		// make the options html
		let domOptions = options.map(option => <option key={"option_"+option} value={option} >{labeller(option)}</option>);
		let sv = value || defaultValue;
		return (
			<select className='form-control' name={prop} value={sv} onChange={onChange} {...rest} >
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

Misc.ControlTypes = new Enum("img imgUpload textarea text select autocomplete password email url color Money checkbox"
							+" yesNo location date year number arraytext address postcode json");

/**
 * Strip commas £/$/euro and parse float
 * @param {*} v 
 * @returns Number. undefined/null are returned as-is.
 */
const numFromAnything = v => {
	if (v===undefined || v===null) return v;
	if (_.isNumber(v)) return v;
	// strip any commas, e.g. 1,000
	if (_.isString(v)) {
		v = v.replace(/,/g, "");
		// £ / $ / euro
		v = v.replace(/^(-)?[£$\u20AC]/, "$1");
	}
	return parseFloat(v);
};

const PropControlMoney = ({prop, value, path, proppath, 
									item, bg, dflt, saveFn, modelValueFromInput, ...otherStuff}) => {
		// special case, as this is an object.
	// Which stores its value in two ways, straight and as a x100 no-floats format for the backend
	// Convert null and numbers into MA objects
	if ( ! value || _.isString(value) || _.isNumber(value)) {
		value = Money.make({value});
	}
	// prefer raw, so users can type incomplete answers!
	let v = value.raw || value.value;
	if (v===undefined || v===null || _.isNaN(v)) { // allow 0, which is falsy
		v = '';
	}
	//Money.assIsa(value); // type can be blank
	// handle edits
	const onMoneyChange = e => {		
		let newVal = numFromAnything(e.target.value);
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


const PropControlDate = ({prop, item, value, onChange, ...otherStuff}) => {
	// NB dates that don't fit the mold yyyy-MM-dd get ignored by the native date editor. But we stopped using that.
	// NB: parsing incomplete dates causes NaNs
	let datePreview = null;
	if (value) {
		try {
			let date = new Date(value);
			// use local settings??
			datePreview = date.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
		} catch (er) {
			// bad date
			datePreview = 'Invalid date';
		}
	}

	// HACK: also set the raw text in _raw. This is cos the server may have to ditch badly formatted dates.
	// NB: defend against _raw_raw
	const rawProp = prop.substr(prop.length-4, prop.length) === '_raw'? null : prop+'_raw';
	if ( ! value && item && rawProp) value = item[rawProp];
	const onChangeWithRaw = e => {
		if (item && rawProp) {
			item[rawProp] = e.target.value;
		}
		onChange(e);
	};

	// let's just use a text entry box -- c.f. bugs reported https://github.com/winterstein/sogive-app/issues/71 & 72
	// Encourage ISO8601 format
	if ( ! otherStuff.placeholder) otherStuff.placeholder = 'yyyy-mm-dd, e.g. today is '+isoDate(new Date());
	return (<div>
		<FormControl type='text' name={prop} value={value} onChange={onChangeWithRaw} {...otherStuff} />
		<div className='pull-right'><i>{datePreview}</i></div>
		<div className='clearfix' />
	</div>);	
};


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

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const shortWeekdays = weekdays.map(weekday => weekday.substr(0, 3));
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const shortMonths = months.map(month => month.substr(0, 3));

const oh = (n) => n<10? '0'+n : n;

Misc.LongDate = ({date}) => {
	if (_.isString(date)) date = new Date(date);
	return <span>{`${weekdays[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`}</span>;
};

/**
 * Human-readable, unambiguous date+time string which doesn't depend on toLocaleString support
 */
Misc.dateTimeString = (d) => (
	`${d.getDate()} ${shortMonths[d.getMonth()]} ${d.getFullYear()} ${oh(d.getHours())}:${oh(d.getMinutes())}`
);

Misc.AvatarImg = ({peep, ...props}) => {
	if ( ! peep) return null;
	let { img, name } = peep;
	let { className, alt, ...rest} = props;
	const id = getId(peep);

	name = name || (id && XId.id(id)) || 'anon';
	alt = alt || `Avatar for ${name}`;

	if ( ! img) {
		// try a gravatar -- maybe 20% will have one c.f. http://euri.ca/2013/how-many-people-use-gravatar/index.html#fnref-1104-3
		if (id && XId.service(id) === 'email') {
			let e = XId.id(id);
			img = 'https://www.gravatar.com/avatar/'+md5(e);						
		}
		// security paranoia -- but it looks like Gravatar dont set a tracking cookie
		// let html = `<img className='AvatarImg' alt=${'Avatar for '+name} src=${src} />`;
		// return <iframe title={nonce()} src={'data:text/html,' + encodeURIComponent(html)} />;
	}

	return <img className={`AvatarImg img-thumbnail ${className}`} alt={alt} src={img} {...rest} />;
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
 * @returns the model value/object to be stored in DataStore
 */
const standardModelValueFromInput = (inputValue, type, eventType) => {
	if ( ! inputValue) return inputValue;
	// numerical?
	if (type==='year') {
		return parseInt(inputValue);
	}
	if (type==='number') {		
		return numFromAnything(inputValue);
	}
	// url: add in https:// if missing
	if (type==='url' && eventType==='blur') {
		if (inputValue.indexOf('://') === -1 && inputValue[0] !== '/' && 'http'.substr(0, inputValue.length) !== inputValue.substr(0,4)) {
			inputValue = 'https://'+inputValue;
		}
	}
	return inputValue;
};


/**
 * @param d {Date}
 * @returns {String}
 */
const isoDate = (d) => d.toISOString().replace(/T.+/, '');

/**
 * 
 * @param {
 * 	url: {?String} The image url. If falsy, return null
 * 	style: {?Object}
 * }
 */
Misc.ImgThumbnail = ({url, style}) => {
	if ( ! url) return null;
	// add in base (NB this works with style=null)
	style = Object.assign({width:'100px', maxHeight:'200px'}, style);
	return (<img className='img-thumbnail' style={style} alt='thumbnail' src={url} />);
};

Misc.VideoThumbnail = ({url}) => url? <video width={200} height={150} src={url} controls /> : null;

/**
 * This replaces the react-bootstrap version 'cos we saw odd bugs there. 
 * Plus since we're providing state handling, we don't need a full component.
 */
const FormControl = ({value, type, required, ...otherProps}) => {
	if (value===null || value===undefined) value = '';

	if (type==='color' && ! value) { 
		// workaround: this prevents a harmless but annoying console warning about value not being an rrggbb format
		return <input className='form-control' type={type} {...otherProps} />;	
	}
	// add css classes for required fields
	let klass = 'form-control'+ (required? (value? ' form-required' : ' form-required blank') : '');
	return <input className={klass} type={type} value={value} {...otherProps} />;
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
Misc.Card = ({title, glyph, icon, children, onHeaderClick, collapse, titleChildren, ...props}) => {
	const h3 = (<h3 className="panel-title">{icon? <Misc.Icon glyph={glyph} fa={icon} /> : null} 
		{title || ''} {onHeaderClick? <Misc.Icon className='pull-right' glyph={'triangle-'+(collapse?'bottom':'top')} /> : null}
	</h3>);
	return (<div className="Card panel panel-default">
		<div className={onHeaderClick? "panel-heading btn-link" : "panel-heading"} onClick={onHeaderClick} >
				{h3}
				{ titleChildren }
			</div>
		<div className={'panel-body' + (collapse? ' collapse' : '') }>
				{children}
			</div>
	</div>);
};

/**
 * 
 * @param {?String} widgetName - Best practice is to give the widget a name.
 * @param {Misc.Card[]} children
 */
Misc.CardAccordion = ({widgetName, children, multiple, start}) => {
	// NB: React-BS provides Accordion, but it does not work with modular panel code. So sod that.
	// TODO manage state
	const wcpath = ['widget', widgetName || 'CardAccordion', 'open'];
	let open = DataStore.getValue(wcpath);
	if ( ! open) open = [true]; // default to first kid open
	if ( ! children) {
		return (<div className='CardAccordion'></div>);
	}
	assert(_.isArray(open), "Misc.jsx - CardAccordion - open not an array", open);
	// filter null, undefined
	children = children.filter(x => !! x);
	const kids = React.Children.map(children, (Kid, i) => {
		let collapse = ! open[i];
		let onHeaderClick = e => {
			if ( ! multiple) {
				// close any others
				open = [];
			}
			open[i] = collapse;
			DataStore.setValue(wcpath, open);
		};
		// clone with click
		return React.cloneElement(Kid, {collapse, onHeaderClick: onHeaderClick});
	});
	return (<div className='CardAccordion'>{kids}</div>);
};

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
	const vis ={visibility: isSaving? 'visible' : 'hidden'};

	return (<div className='SavePublishDiscard' title={item && item.status}>
		<div><small>Status: {item && item.status}, Modified: {localStatus} {isSaving? "saving...":null}</small></div>
		<button className='btn btn-default' disabled={isSaving || C.STATUS.isclean(localStatus)} onClick={() => ActionMan.saveEdits(type, id)}>
			Save Edits <span className="glyphicon glyphicon-cd spinning" style={vis} />
		</button>
		&nbsp;
		<button className='btn btn-primary' disabled={isSaving || noEdits} onClick={() => ActionMan.publishEdits(type, id)}>
			Publish Edits <span className="glyphicon glyphicon-cd spinning" style={vis} />
		</button>
		&nbsp;
		<button className='btn btn-warning' disabled={isSaving || noEdits} onClick={() => ActionMan.discardEdits(type, id)}>
			Discard Edits <span className="glyphicon glyphicon-cd spinning" style={vis} />
		</button>
		&nbsp;
		<button className='btn btn-danger' disabled={isSaving} onClick={() => ActionMan.delete(type, id)} >
			Delete <span className="glyphicon glyphicon-cd spinning" style={vis} />
		</button>
	</div>);
};

/**
 * 
 * @param {Boolean} once If set, this button can only be clicked once.
 */
Misc.SubmitButton = ({path, url, once, className='btn btn-primary', onSuccess, children}) => {
	assMatch(url, String);
	assMatch(path, 'String[]');
	const tpath = ['transient','SubmitButton'].concat(path);

	let formData = DataStore.getValue(path);
	// DataStore.setValue(tpath, C.STATUS.loading);
	const params = {
		data: formData
	};
	const doSubmit = e => {
		DataStore.setValue(tpath, C.STATUS.saving);
		ServerIO.load(url, params)
			.then(res => {
				DataStore.setValue(tpath, C.STATUS.clean);
			}, err => {
				DataStore.setValue(tpath, C.STATUS.dirty);
			});
	};
	
	let localStatus = DataStore.getValue(tpath);
	// show the success message instead?
	if (onSuccess && C.STATUS.isclean(localStatus)) {
		return onSuccess;
	}
	let isSaving = C.STATUS.issaving(localStatus);	
	const vis ={visibility: isSaving? 'visible' : 'hidden'};
	let disabled = isSaving || (once && localStatus);
	let title ='Submit the form';
	if (disabled) title = isSaving? "saving..." : "Submitted :) To avoid errors, you cannot re-submit this form";	
	return (<button onClick={doSubmit} 
		className={className}
		disabled={disabled}
		title={title}
	>
		{children}
		<span className="glyphicon glyphicon-cd spinning" style={vis} />
	</button>);
};

export default Misc;
// // TODO rejig for export {
// 	PropControl: Misc.PropControl
// };
