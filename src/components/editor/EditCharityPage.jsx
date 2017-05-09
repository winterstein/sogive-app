// @Flow
import React from 'react';
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import {yessy} from 'wwutils';
import { Panel, Image, Well, Label, Grid, Row, Col, Accordion } from 'react-bootstrap';

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
			DataStore.setValue(['draft', C.TYPES.Charity, cid], charity);
		});
	}

	render() {
		let cid = this.props.charityId;
		let charity = DataStore.getValue('draft', C.TYPES.Charity, cid);
		if ( ! charity) {
			return <Misc.Loading />;
		}		
		// projects
		let allprojects = charity.projects;
		// split out overall vs projects
		let overalls = _.filter(allprojects, p => Project.name(p) === 'overall');
		let projectProjects = _.filter(allprojects, p => Project.name(p) !== 'overall');
		// sort by year
		overalls = _.sortBy(overalls, p => - (p.year || 0) );

		// put it together
		console.log("EditCharity", charity);
		return (
			<div className='page EditCharityPage'>				
				<Panel>
					<h2>Editing: {charity.name}</h2>					
						<button onClick={(e) => publishDraftFn(e, charity)} disabled={ ! charity.modified} className='btn btn-primary'>Publish</button> &nbsp;
						<button onClick={(e) => discardDraftFn(e, charity)} disabled={ ! charity.modified} className='btn btn-warning'>Discard Edits</button>
				</Panel>
				<Accordion>
					<Panel header={<h3>Charity Profile</h3>} eventKey="1">
						<div><small>SoGive ID: {NGO.id(charity)}</small></div>
						<EditField item={charity} type='text' field='name' />
						<EditField item={charity} type='text' field='nickname' />
						<EditField item={charity} type='text' field='tags' />
						<EditField item={charity} type='textarea' field='description' />
						<EditField item={charity} type='img' field='logo' />
						<EditField item={charity} type='img' field='logo_white' label='White-on-transparent poster logo' />
						<EditField item={charity} type='img' field='image' label='Photo' />
						<EditField item={charity} type='color' field='image' label='Brand colour' />
						<EditField item={charity} type='url' field='url' label='Website' />
					</Panel>
					<Panel header={<h3>Overall Finances</h3>} eventKey="2">
						<ProjectsEditor projects={overalls} />
					</Panel>
					<Panel header={<h3>Projects</h3>} eventKey="3">
					</Panel>
					<Panel header={<h3>References</h3>} eventKey="4">
					</Panel>
				</Accordion>
			</div>
		);
	}
} // ./EditCharityPage

const ProjectsEditor = ({projects}) => {
	let rprojects = projects.map(p => <ProjectEditor key={p.name+'-'+p.year} project={p} />);
	return <div>{rprojects}</div>;
};

const ProjectEditor = ({project}) => {
	return <div><h4>Project Editor: {project.name}</h4><pre>{printer.str(project)}</pre></div>;
};

const publishDraftFn = _.throttle((e, charity) => {
	ServerIO.publish(charity, 'draft');
}, 250);
const discardDraftFn = _.throttle((e, charity) => {
	ServerIO.discardEdits(charity);
}, 250);

const saveDraftFn = _.debounce(
	({path}) => {
		let charity = DataStore.getValue(path);
		assert(NGO.isa(charity), charity, path);
		ServerIO.saveCharity(charity, 'draft')
		.then((result) => {
			let modCharity = result.cargo;
			assert(NGO.isa(modCharity), modCharity);
			DataStore.setValue(['draft', C.TYPES.Charity, NGO.id(modCharity)], modCharity);
		});
		return true;
	}, 1000);


const EditField = ({item, ...stuff}) => {
	let id = NGO.id(item);
	let path = ['draft',C.TYPES.Charity,id];
	return <EditField2 item={item} path={path} {...stuff} />;
};

const EditField2 = (props) => {
	let {item, field, type, help, label, path} = props;
	// console.log('EditField2', props);
	assMatch(field, String);
	let meta = (item.meta && item.meta[field]) || {};
	return (
		<div>			
			<Misc.Col2>
				<Misc.PropControl label={label || field} type={type} prop={field} 
					path={path} item={item} 
					saveFn={saveDraftFn}
					/>
				<div className='flexbox'>
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
