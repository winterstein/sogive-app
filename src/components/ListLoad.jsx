import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import Login from 'you-again';
import printer from '../utils/printer.js';
import {modifyHash} from 'wwutils';
import C from '../C';
import Roles from '../Roles';
import Misc from './Misc';
import DataStore from '../plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import {getType, getId} from '../data/DataClass';

/**
 * Provide a list of items of a given type.
 * Clicking on an item sets it as the nav value.
 * Get the item id via:
 * 
 * 	const path = DataStore.getValue(['location','path']);
 * 	const itemId = path[1];
 *  let item = itemId? ActionMan.getDataItem(itemId) : null;
 * 
 * 
 * @param status {?String} e.g. "Draft"
 * @param servlet {?String} e.g. "publisher" Normally unset, and taken from the url.
 * @param ListItem {?React component} if set, replaces DefaultListItem
 */
const ListLoad = ({type, status, servlet, ListItem}) => {
	assert(C.TYPES.has(type), "ListLoad - odd type " + type);
	assert(!status || C.KStatus.has(status), "ListLoad - odd status " + status);
	let path = DataStore.getValue(['location','path']);
	let id = path[1];
	if (id) return null;
	if ( ! servlet) servlet = DataStore.getValue('location', 'path')[0]; //type.toLowerCase();
	// store the lists in a separate bit of appstate
	// from data. 
	// Downside: new events dont get auto-added to lists
	// Upside: clearer
	let pvItems = DataStore.fetch(['list', type, 'all'], () => {
		return ServerIO.load(`/${servlet}/list.json`, {data: {status}} )
			.then((res) => {
				// console.warn(res);
				return res.cargo.hits;
			});
	});
	if ( ! pvItems.value) {
		return (
			<Misc.Loading text={type.toLowerCase()+'s'} />
		);
	}
	if ( ! ListItem) {
		ListItem = DefaultListItem;
	}
	console.warn("items", pvItems.value);
	return (<div>
		{pvItems.value.length === 0 ? 'No results found' : null}
		{pvItems.value.map(item => <ListItem key={getId(item) || JSON.stringify(item)} 
										type={type} servlet={servlet} item={item} onPick={onPick} />)}
	</div>);
};

const onPick = ({event,servlet,id}) => {
	if (event) {
		event.stopPropagation();
		event.preventDefault();
	}
	modifyHash([servlet, id]);
};

const DefaultListItem = ({type, servlet, item}) => {	
	const id = getId(item);
	const itemUrl = modifyHash([servlet, id], null, true);
	return (
		<div className={'ListItem btn btn-default status-'+item.status}>
			<a 	href={itemUrl} 
				onClick={ event => onPick({event, servlet, id}) }
			>
				{C.KStatus.isPUBLISHED(item.status)? <span className='text-success'><Misc.Icon glyph='tick' /></span> : item.status} 
				{item.name || id}<br/>
				<small>id: {id}</small>
			</a>
		</div>
	);
};

export default ListLoad;
