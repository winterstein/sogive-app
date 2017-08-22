import React from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest';
const assert = SJTest.assert;
import printer from '../utils/printer.js';
// Plumbing
import DataStore from '../plumbing/DataStore';
import C from '../C.js';

const MessageBar = ({messages}) => {
	if ( ! messages || messages.length===0) return <div></div>;
	const messageUI = messages.map( (m, mi) => <MessageBarItem key={'mi'+mi} message={m} /> );
	return (<div className='messagebar'>{messageUI}</div>);
}; // ./Messagebar


const MessageBarItem = ({message}) => {
	if (message.closed) {
		return (<div></div>);
	}
	const alertType = message.type==="error"? "alert alert-danger" : "alert alert-warning";
	return (
		<div className={alertType}>{message.text}
			<div className='hidden'>Details {message.details}</div>
			<button onClick={ e => { message.closed=true; DataStore.update(); } } type="button" className="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
		</div>
	);
};

export default MessageBar;
