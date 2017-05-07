// @Flow
import React from 'react';
import _ from 'lodash';
import {assert} from 'sjtest';
import {yessy} from 'wwutils';
import { Panel, Image, Well, Label, Grid, Row, Col } from 'react-bootstrap';

import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../plumbing/DataStore';
import printer from '../../utils/printer';
import C from '../../C';
import NGO from '../../data/charity/NGO';
import Project from '../../data/charity/Project';
import Misc from '../Misc';

class EditCharityPage extends React.Component {

	constructor(...params) {
		super(...params);
	}

	componentWillMount() {
		// fetch
		let cid = this.props.charityId;
		ServerIO.getCharity(cid, 'draft')
		.then(function(result) {
			let charity = result.cargo;
			assert(NGO.isa(charity), charity);
			DataStore.setValue(['data', C.TYPES.Charity, cid], charity);
		}.bind(this));
	}

	render() {
		let cid = this.props.charityId;
		let charity = DataStore.getValue('data', C.TYPES.Charity, cid);
		if ( ! charity) {
			return <Misc.Loading />;
		}
		// put it together
		console.log("EditCharity", charity);
		return (
			<div className='page EditCharityPage'>
				<h2>Edit: {charity.name}</h2>
				<Panel>
					Charity Profile
					<EditField item={charity} type='textarea' field='description' />

				</Panel>
				<Panel>
					Overall Finances
				</Panel>
			</div>
		);
	}
} // ./EditCharityPage

const saveDraftFn = ({path}) => {
	let charity = DataStore.getValue(path);
	assert(NGO.isa(charity), charity, path);
	ServerIO.saveCharity(charity, 'draft');
	return true;
};

const EditField = ({item, field, type, help}) => {
	let id = NGO.id(item);
	let meta = (item.meta && item.meta[field]) || {};
	return (
		<div>
			{field}			
			<Misc.Col2>
				<Misc.PropControl type={type} prop={field} 
					path={['data',C.TYPES.Charity,id]} item={item} 
					saveFn={saveDraftFn}
					/>
				<div>
					<div>
						<Misc.Icon fa='info-circle' /> Guidance:
						{help}
					</div>
					<div>
						<Misc.Icon fa='user' />
						Last editor: {meta.lastEditor}
					</div>
					<div>
						<Misc.Icon fa='external-link' />
					Source: {meta.source}
					</div>
					<div>
						<Misc.Icon fa='comment-o' />
					Notes: {meta.notes}
					</div>
				</div>
			</Misc.Col2>
		</div>
	);
};

export default EditCharityPage;
