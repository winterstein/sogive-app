import React from 'react';
import ReactDOM from 'react-dom';
import printer from '../js/util/printer.js';
import {XId} from 'wwutils';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Panel, PanelHead, Glyphicon, Button, Badge} from 'react-bootstrap';

const Util = {

	/** eg a Twitter logo */
	Logo: React.createClass({
		render: function() {
			const service = this.props.service;
			assert(service);
			let klass = "img-rounded logo";
			if (this.props.size) klass += "-"+this.props.size;
			let file = '/img/'+service+'-logo.svg';
			if (service==='instagram') file = '/img/'+service+'-logo.png';
			return (<img alt={service} className={klass} src={file} />);
		}
	}), // ./Logo

	/**
	E.g. "Loading your settings...""
	*/
	Loading: React.createClass({
		render: function() {
			const text = this.props.text? ' '+this.props.text : '';
			return (<div className='text-center'><span className="glyphicon glyphicon-cd spinning"></span> Loading{text}...</div>);
		}
	}), // ./Loading

	/**
			The html wrapper for a card. Assumes they are part of a list.
	*/
	CardWrapper: React.createClass({
		render: function() {
			const heading = this.props.heading? <PanelSection type="heading" children={ this.props.heading } scriptlet={this.props.scriptlet} /> : '';
			const body = this.props.body? <PanelSection type="body" children={ this.props.body } scriptlet={this.props.scriptlet} /> : '';
			const footer = this.props.footer? <PanelSection type="footer" children={ this.props.footer } /> : '';
			const debug = ''; //<small>{ printer.str(this.props.debug || '') + ((this.props.scriptlet && this.props.scriptlet.id) || '') }</small>;
			let klass = 'card panel panel-default slide-hide';
			if (this.props.extraPanelClass) klass += ' '+this.props.extraPanelClass;
			// focus?
			const scriptlet = this.props.scriptlet;			
			if (scriptlet && scriptlet.isFocus()) {
				klass += ' inFocus';
			} else if (scriptlet && scriptlet.isFocusBranch()) {
				klass += ' bg-success'; // subtly different focus marking for active parents.
			}
			// default onClick - setFocus
			let onClick = this.props.onClick;

			// Is this behind the browser-locks-up bug??
			// if ( ! onClick && this.props.scriptlet) {
			// 	// also the chat focus is here
			// 	// Bug: If you click on a skip-this button, React is nevertheless calling this onclick, 
			// 	// and somehow doing so _after_ the deferred start of new scriplets. With the effect that
			// 	// focus jumps back :(
			// 	// HACK - also in Scriptlet.js
			// 	onClick = function(event) {
			// 		// const lf = this.props.scriptlet.state.lastFocus; 
			// 		// if (lf && new Date().getTime() - lf < 100) {
			// 		// 	console.log("not setting focus to ", this.props.scriptlet.id);
			// 		// 	return;
			// 		// }
			// 		if (event.isDefaultPrevented()) {
			// 			console.log("not setting focus to ", this.props.scriptlet.id);
			// 			return;
			// 		}
			// 		this.props.scriptlet.setFocus();
			// 	}.bind(this);
			// }
			
			// render as an <li>
			return (
				<li className={klass} onClick={onClick}>
					{ heading }
					{ body }
					{ footer }
					{ debug }
				</li>
			);
		}
	}), // ./CardWrapper

	/**
			A text-input form field - notifes parent through onChange and onBlur.
	*/
	TextField: React.createClass({

		render: function() {
			// use JSX/ES6 spread function to create "other" = this.props minus this.props.inline
			// What exactly is inline?? ^Dan
			// u00a0 = xao = nbsp for react c.f. http://stackoverflow.com/questions/24432576/reactjs-render-string-with-non-breaking-spaces#24437562
			const {value,size,inline,submit,onSubmit,showSubmit,isFocus,error,label,inputType, ...other } = this.props;
			assert(other.name, this.props);
			assert(other.onChange && other.onBlur, this.props);
			let klass = "form-control";
			let grpKlass = "form-group";
			if (error) {
				klass += " bg-danger";
				grpKlass += " has-error";
			}
			if (size) {
				grpKlass += ' form-group-'+size;
			}
			// inline -> nbsp for react
			return (
				<div className={grpKlass}>
					<Label label={label} />
					{label && inline? "\u00a0" : '' }
					<input value={value||''} className={klass} type={'text'}
						{ ...other } />
					{inline? "\u00a0" : '' }
					<SubmitButton size={size} showSubmit={showSubmit} 
						onSubmit={onSubmit}
						value={value} contents={submit} onClick={other.onBlur} isFocus={isFocus} />
					<ErrorDiv error={error} />
				</div>
			);
		}
	}) // ./SettingTextField

}; // ./export
export default Util;

const Label = ({ label }) => label? <label>{label}</label> : null;

/**
 * This is nice -- small react components can just be functions, props to tags
 */
const ErrorDiv = ({ error }) => error? <div className="text-danger">{ error }</div> : null;

const SubmitButton = ({size, onSubmit, showSubmit, value, contents, onClick, isFocus}) => {
	if ( ! showSubmit && ! (value && contents)) return null;
	let klass = isFocus? 'btn btn-primary' : 'btn btn-default';
	if (size) klass += ' btn-'+size;
	return <button onClick={onSubmit} className={klass}>{contents}</button>;
};
SubmitButton.propTypes = {

};

/**
		i.e. panel-heading, panel-body or panel-footer
*/
var PanelSection = React.createClass({
	render: function() {
		assert(this.props.type, "PanelSection invoked without type")
		let klass = "panel-" + this.props.type;
		const scriptlet = this.props.scriptlet;
		let badge = '';
		if (this.props.type==='heading' && scriptlet) {
			const ended = scriptlet.state.ended;
			if (ended) {
				badge = <Badge pullRight={true}><Glyphicon glyph={ scriptlet.state.rejected? 'remove' : 'ok'} /></Badge>
			}
		}
		return (
			<div className={ klass }>{ this.props.children }{badge}</div>
		);
	}
}); // ./ PanelSection


Util.ItemName = ({name,xid,url}) => {
	if ( ! name && ! xid ) return null;
	const dname= name ||  XId.prettyName(xid);
	if (url) {
		return (<div><a title={XId.id(xid)} href={url} target='_new'>{dname}</a></div>);		
	}
	return (<div title={XId.id(xid)}>{dname}</div>);	
};

/**
 * NOT USED
 * TODO refactor away from CardWrapper??
 */
Util.CardPanel = class CardPanel extends React.Component {
	render() {
		let header = this.props.header;
		// tick-mark? 		
		if (this.props.scriptlet) {
			const ended = this.props.scriptlet.state.ended;
			if (ended) {
				let badge = <span className='badge pull-right'><span className='glyphicon glyphicon-ok'></span></span>
				if (header) {
					header = (<div>{header}{badge}</div>);
				} else {
					header = badge;
				}
			}
		}
		// colour if focus
		let bsStyle = 'default';
		if (this.props.scriptlet && this.props.scriptlet.isFocus()) {
			bsStyle = 'info';
		} else if (this.props.scriptlet && this.props.scriptlet.isFocusBranch()) {
			bsStyle = 'success'; // subtly different focus marking for active parents.
		}	
		// its a panel
		return (
			<div className='card slide-hide'>
				<Panel bsStyle={bsStyle} header={this.props.header} footer={this.props.footer} onClick={this.props.onClick}>
					{ this.props.children }
				</Panel>
			</div>
		);
	}
};