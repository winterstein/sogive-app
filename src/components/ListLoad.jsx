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

const ListLoad = ({type, status, servlet, ListItem}) => {
	let path = DataStore.getValue(['location','path']);
	let id = path[1];
	if (id) return null;
	if ( ! servlet) servlet = DataStore.getValue('location', 'path')[0]; //type.toLowerCase();
	// store the lists in a separate bit of appstate
	// from data. 
	// Downside: new events dont get auto-added to lists
	// Upside: clearer
	let items = DataStore.fetch(['list', type, 'all'], () => {
		return ServerIO.load('/event/list.json', {data: {status}} )
			.then((res) => {
				// console.warn(res);
				return res.cargo.hits;
			});
	});
	if ( ! items.value) {
		return (
			<Misc.Loading text={type.toLowerCase()+'s'} />
		);
	}
	if ( ! ListItem) {
		ListItem = DefaultListItem;
	}
	return (<div>
		{items.value.length === 0? 'No results found' : null }
		{items.value.map(item => <ListItem key={getId(item)} type={type} servlet={servlet} item={item} onPick={onPick} />)}
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
		<div>
			<a 	href={itemUrl} 
				onClick={ event => onPick({event, servlet, id}) }
			>
				id: {id}, name: {item.name}, status: {item.status}
			</a>
		</div>
	);
};

export default ListLoad;
