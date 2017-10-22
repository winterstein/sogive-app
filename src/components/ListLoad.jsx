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

const ListLoad = ({type, status, ListItem}) => {
	let path = DataStore.getValue(['location','path']);
	let id = path[1];
	if (id) return null;
	// store the lists in a separate bit of appstate
	// from data. 
	// Downside: new events dont get auto-added to lists
	// Upside: clearer
	let items = DataStore.fetch(['list', type, 'all'], () => {
		return ServerIO.load('/event/_list.json', {data: {status}} )
			.then((res) => {
				console.warn(res);
				return res.cargo;
			});
	});
	if ( ! items.value) {
		return (
			<Misc.Loading text={'Loading '+type.toLowerCase()+'s'} />
		);
	}
	if ( ! ListItem) {
		ListItem = DefaultListItem;
	}
	return (<div>
		{items.value.map(item => <ListItem type={type} item={item} onPick={onPick} />)}
	</div>);
};
const onPick = ({event,type,id}) => {
	if (event) {
		event.stopPropagation();
		event.preventDefault();
	}
	modifyHash([type, id], null);			
};
const DefaultListItem = ({type, item}) => {	
	const id = getId(item);
	const itemUrl = modifyHash([type, id], null, true);
	return (
		<div>
			<a 	href={itemUrl} 
				onClick={ event => onPick({event, type, id}) }
			>
				id: {id}, name: {item.name}, status: {item.status}
			</a>
		</div>
	);
};

export default ListLoad;
