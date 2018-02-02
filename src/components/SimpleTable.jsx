/*
	Copying a little bit of react-table
	Because react-table was causing my system to crash.
	See https://github.com/react-tools/react-table#example
*/

import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert, assMatch} from 'sjtest';
import _ from 'lodash';
import Misc from './Misc';
import printer from '../utils/printer';

import DataStore from '../plumbing/DataStore';

const str = printer.str;

const SimpleTable = ({data, columns}) => {

	return (
		<table className='table'>
			<tbody>
				<tr>{columns.map(col => <Th key={JSON.stringify(col)} column={col} />)}</tr>
				{data.map( (d,i) => <Row key={i} item={d} row={i} columns={columns} />)}
			</tbody>
		</table>
	);
};

const Th = ({column}) => <th>{ column.Header || column.name || column.id || str(column)}</th>;

const Row = ({item, row, columns}) => {
	return (<tr>
		{columns.map(col => <Cell key={JSON.stringify(col)} row={row} column={col} item={item} />)}
	</tr>);
};

const Cell = ({item, row, column}) => {
	try {
		let accessor = column.accessor || column; 
		let v = _.isFunction(accessor)? accessor(item) : item[accessor];
		let render = column.Cell;
		if ( ! render) {
			if (column.editable) {
				render = val => <Editor value={val} row={row} column={column} item={item} />;
			} else {
				render = val => str(val);
			}
		}
		return <td>{render(v)}</td>;
	} catch(err) {
		// be robust
		console.error(err);
		return <td>{str(err)}</td>;
	}
};

const Editor = ({row, column, value, item}) => {
	let path = column.path || DataStore.getPath(item);
	let prop = column.prop || (_.isString(column.accessor) && column.accessor);
	let dummyItem;
	if (path && prop) {
		// use item direct
		dummyItem = item;
	} else {
		// fallback to dummies
		if ( ! path) path = ['widget', 'SimpleTable', row, str(column)];
		if ( ! prop) prop = 'value';
		let editedValue = DataStore.getValue(path.concat(prop));
		if (editedValue===undefined || editedValue===null) editedValue = value;
		dummyItem[prop] = editedValue;
	}

	let type = column.type;
	return (<Misc.PropControl type={type} item={dummyItem} path={path} prop={prop} 
		saveFn={column.saveFn} 
	/>);
};

export default SimpleTable;
