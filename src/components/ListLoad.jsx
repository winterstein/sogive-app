import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, { assert, assMatch } from 'sjtest';
import Login from 'you-again';
import printer from '../utils/printer.js';
import {modifyHash} from 'wwutils';
import C from '../C';
import Roles from '../Roles';
import Misc from './Misc';
import DataStore from '../plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import {getType, getId, nonce} from '../data/DataClass';

/**
 * Provide a list of items of a given type.
 * Clicking on an item sets it as the nav value.
 * Get the item id via:
 * 
 * 	const path = DataStore.getValue(['location','path']);
 * 	const itemId = path[1];
 *  let pvItem = itemId? ActionMan.getDataItem(itemId) : null;
 * 
 * 
 * @param status {?String} e.g. "Draft"
 * @param servlet {?String} e.g. "publisher" Normally unset, and taken from the url.
 * @param ListItem {?React component} if set, replaces DefaultListItem
 */
const ListLoad = ({type, status, servlet, navpage, q, ListItem, checkboxes}) => {
	assert(C.TYPES.has(type), "ListLoad - odd type " + type);
	assert(!status || C.KStatus.has(status), "ListLoad - odd status " + status);
	let path = DataStore.getValue(['location','path']);
	let id = path[1];
	if (id) return null;
	if ( ! servlet) servlet = DataStore.getValue('location', 'path')[0]; //type.toLowerCase();
	if ( ! navpage) navpage = servlet;
	if ( ! servlet) {
		console.warn("ListLoad - no servlet? type="+type);
		return null;
	}
	assMatch(servlet, String);
	assMatch(navpage, String);
	// store the lists in a separate bit of appstate
	// from data. 
	// Downside: new events dont get auto-added to lists
	// Upside: clearer
	let pvItems = DataStore.fetch(['list', type, 'all'], () => {
		return ServerIO.load(`/${servlet}/list.json`, { data: { status, q } })
			.then((res) => {
				// console.warn(res);
				return res.cargo.hits;
			});
	});
	if ( ! pvItems.resolved) {
		return (
			<Misc.Loading text={type.toLowerCase()+'s'} />
		);
	}
	if ( ! ListItem) {
		ListItem = DefaultListItem;
	}
	console.warn("items", pvItems.value);
	const listItems = pvItems.value.map(item => (
		<ListItem key={getId(item) || JSON.stringify(item)} 
			type={type} 
			servlet={servlet} 
			navpage={navpage} 
			item={item} 
			onPick={onPick} 
			checkboxes={checkboxes} />)
	);
	return (<div>
		{pvItems.value.length === 0 ? 'No results found' : null}
		{listItems}
	</div>);
};

const onPick = ({event, navpage, id}) => {
	if (event) {
		event.stopPropagation();
		event.preventDefault();
	}
	modifyHash([navpage, id]);
};

/**
 * These can be clicked or control-clicked :(
 */
const DefaultListItem = ({type, servlet, navpage, item, checkboxes}) => {
	if ( ! navpage) navpage = servlet;
	const id = getId(item);
	const itemUrl = modifyHash([servlet, id], null, true);
	let checkedPath = ['widget', 'ListLoad', type, 'checked'];
	return (
		<div className='ListItemWrapper'>
			{checkboxes? <div className='pull-left'><Misc.PropControl title='TODO mass actions' path={checkedPath} type='checkbox' prop={id} /></div> : null}
			<a 	href={itemUrl} 
				onClick={event => onPick({ event, navpage, id })}
				className={'ListItem btn btn-default status-'+item.status}
			>
				{C.KStatus.isPUBLISHED(item.status)? <span className='text-success'><Misc.Icon glyph='tick' /></span> : item.status} 
				{item.name || id}<br/>
				<small>id: {id}</small>
			</a>
		</div>
	);
};

/**
 * Make a local blank, and set the nav url
 * Does not save (Crud will probably do that once you make an edit)
 */
const createBlank = ({type, navpage, base}) => {
	// make an id
	let id = nonce(8);
	// poke a new blank into DataStore
	if ( ! base) base = {};
	assert( ! getId(base), "ListLoad - createBlank "+type);
	base.id = id;
	base['@type'] = type;
	DataStore.setValue(['data', type, id], base);
	// set the id
	onPick({navpage, id});
};

const CreateButton = ({type, navpage, base}) => {
	if ( ! navpage) navpage = DataStore.getValue('location', 'path')[0];
	return (
		<button className='btn btn-default' onClick={() => createBlank({type,navpage,base})}>
			<Misc.Icon glyph='plus' /> Create
		</button>
	);
};

export {CreateButton};
export default ListLoad;
