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

// class ErrorBoundary extends React.Component {
// https://reactjs.org/docs/error-boundaries.html

const SimpleTable = ({tableName='SimpleTable', data, columns}) => {
	let tableSettings = DataStore.getValue('widget', tableName);
	if ( ! tableSettings) {
		tableSettings = {};
		DataStore.setValue(['widget', tableName], tableSettings, false);
	}
	if (tableSettings.sortBy) {
		// TODO pluck the right column
		let column = columns[tableSettings.sortBy];
		let sortFn = (a,b) => {
			return getValue({item:a, column}) < getValue({item:b, column});
		};
		data = data.sort(sortFn);
	}
	return (
		<table className='table'>
			<tbody>
				<tr>{columns.map((col, c) => <Th tableSettings={tableSettings} key={JSON.stringify(col)} column={col} c={c} />)}</tr>
				{data.map( (d,i) => <Row key={"r"+i} item={d} row={i} columns={columns} />)}
			</tbody>
		</table>
	);
};

// TODO onClick={} sortBy
const Th = ({column, c, tableSettings}) => {
	let sortByMe = (""+tableSettings.sortBy) === (""+c);
	let onClick = e => { 
		console.warn('sort click', c, sortByMe, tableSettings);
		if (sortByMe) {
			tableSettings.sortByReverse = ! tableSettings.sortByReverse;
		} else {
			tableSettings.sortByReverse = false;
		}
		tableSettings.sortBy = c;
	};
	return (<th onClick={onClick} >
		{ column.Header || column.name || column.id || str(column)}
		{sortByMe? '*' : null}
	</th>);
};

const Row = ({item, row, columns}) => {
	return (<tr>
		{columns.map(col => <Cell key={JSON.stringify(col)} row={row} column={col} item={item} />)}
	</tr>);
};

const getValue = ({item, row, column}) => {
	let accessor = column.accessor || column; 
	let v = _.isFunction(accessor)? accessor(item) : item[accessor];
	return v;
};

const Cell = ({item, row, column}) => {
	try {
		const v = getValue({item, row, column});
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
