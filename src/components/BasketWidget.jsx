// // @Flow
// import React, { Component } from 'react';

// import { assert } from 'sjtest';
// import Login from 'you-again';
// import { XId } from 'wwutils';

// import { Button, FormControl, InputGroup, Tabs, Tab, Modal, Table } from 'react-bootstrap';

// import C from '../C';
// import ActionMan from '../plumbing/ActionMan';
// import DataStore from '../plumbing/DataStore';

// import Misc from './Misc';

// const widgetPath = ['widget', 'Basket'];

// const initialWidgetState = {
// 	open: false,
// 	contents: {},
// };


// /**
//  * A shopping basket -- this is NOT essential for now.
//  * 
//  * item:
//  */
// const BasketWidget = () => {
	
// 	let widgetState = DataStore.getValue(widgetPath);
// 	if (!widgetState) {
// 		widgetState = initialWidgetState;
// 		DataStore.setValue(widgetPath, widgetState, false);
// 	}

// 	// Not open? Don't render
// 	if (!widgetState.open) {
// 		return null;
// 	}

// 	const closeLightbox = () => DataStore.setValue([...widgetPath, 'open'], false);

// 	return (
// 		<Modal show={widgetState.open} className="donate-modal" onHide={closeLightbox}>
// 			<Modal.Header closeButton >
// 				<Modal.Title>Your Basket</Modal.Title>
// 			</Modal.Header>
// 			<Modal.Body>
// 				<Table>
// 					<thead>
// 						<th>Item</th>
// 						<th>Quantity</th>
// 						<th>Delete</th>
// 					</thead>
// 					<tbody>
// 						{Object.entries(widgetState.contents).map(([id, qty]) => <BasketItem id={id} qty={qty} />)}
// 					</tbody>
// 				</Table>
// 			</Modal.Body>
// 			<Modal.Footer>
// 				<Button>Check Out</Button>
// 			</Modal.Footer>
// 			{/*
// 				TODO Get local data matching server and restore this
// 				<Misc.SavePublishDiscard type={type} id={donationDraft.id} hidden />
// 			*/}
// 		</Modal>
// 	);
// }; // ./Basket

// const BasketItem = ({id, qty}) => {
// 	if (!qty) return null;
// 	const pProduct = ActionMan.getDataItem({type: C.TYPES.Product, id});
// 	const product = pProduct.value;
// 	if (!product) {
// 		// Fetch still running? Show a placeholder
// 		if ( ! pProduct.resolved) {
// 			return <Misc.Loading />;
// 		}
// 		// Fetch ran without returning product? ERROR
// 		// TODO Tolerate deleted products in basket
// 		assert(false);
// 	}

// 	return (
// 		<tr>
// 			<td>{product.name}</td>
// 			<td>{qty}</td>
// 			<td><Button onClick={() => ActionMan.modifyBasket({id, qty: -qty})}>Del</Button></td>
// 		</tr>
// 	);
// };

// export default BasketWidget;
