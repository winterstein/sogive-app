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
import Login from 'hooru';

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
		// if ( ! Login.isLoggedIn()) {
		// 	return <div>Please login</div>;
		// }
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
		projectProjects = _.sortBy(projectProjects, p => - (p.year || 0) );

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
						<EditField item={charity} type='url' field='url' label='Website' />
						<EditField item={charity} type='text' field='tags' />
						<EditField item={charity} type='textarea' field='description' />
						<EditField item={charity} type='img' field='logo' />
						<EditField item={charity} type='img' field='logo_white' label='White-on-transparent poster logo' />
						<EditField item={charity} type='img' field='image' label='Photo' />
						<EditField item={charity} type='color' field='image' label='Brand colour' />						
					</Panel>
					<Panel header={<h3>Overall Finances</h3>} eventKey="2">
						<ProjectsEditor charity={charity} projects={overalls} />
					</Panel>
					<Panel header={<h3>Projects ({projectProjects.length})</h3>} eventKey="3">
						<ProjectsEditor charity={charity} projects={projectProjects} />
					</Panel>
					<Panel header={<h3>References</h3>} eventKey="4">
					</Panel>
				</Accordion>
			</div>
		);
	}
} // ./EditCharityPage

const ProjectsEditor = ({charity, projects}) => {
	if (projects.length===0) {
		return <div>No projects analysed. This is correct for charities which focus on a single overall project.</div>;	
	}
	let rprojects = projects.map((p,i) => <Panel key={p.name+'-'+p.year} eventKey={i+1} header={<h4>{p.name} {p.year}</h4>}><ProjectEditor charity={charity} project={p} /></Panel>);
	return <div><Accordion>{rprojects}</Accordion></div>;
};

const ProjectEditor = ({charity, project}) => {	
	return (<div>
		<EditProjectField charity={charity} project={project} type='textarea' field='description' label='Description' />
		<EditProjectField charity={charity} project={project} type='img' field='image' label='Photo' />
		<EditProjectField charity={charity} project={project} type='location' field='location' label='Location' />
		<EditProjectField charity={charity} project={project} type='checkbox' field='ready' label='Is this data ready for use?' />
		<EditProjectField charity={charity} project={project} type='checkbox' field='isRep' label='Is this the representative project?' />
		<EditProjectField charity={charity} project={project} type='year' field='year' label='Year' />
		<EditProjectField charity={charity} project={project} type='date' field='start' label='Year start' />
		<EditProjectField charity={charity} project={project} type='date' field='end' label='Year end' />
		<Misc.Col2>
			<ProjectInputs charity={charity} project={project} />
			<ProjectOutputs charity={charity} project={project} />
		</Misc.Col2>
		<ProjectImpacts charity={charity} project={project} />
	</div>);
};

const ProjectInputs = ({charity, project}) => {
	return <div>Inputs{printer.str(project.inputs)}</div>;
};

const ProjectOutputs = ({charity, project}) => {
	return <div>Outputs {printer.str(project.outputs)}</div>;
};

const ProjectImpacts = ({charity, project}) => {
	return <div>Impacts {printer.str(project.impacts)}</div>;
};

const publishDraftFn = _.throttle((e, charity) => {
	ServerIO.publish(charity, 'draft');
}, 250);
const discardDraftFn = _.throttle((e, charity) => {
	ServerIO.discardEdits(charity);
}, 250);


const EditField = ({item, ...stuff}) => {
	let id = NGO.id(item);
	let path = ['draft',C.TYPES.Charity,id];
	return <EditField2 item={item} path={path} {...stuff} />;
};

const EditProjectField = ({charity, project, ...stuff}) => {
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	assert(pid!==-1, project);
	let path = ['draft',C.TYPES.Charity,cid,'projects', pid];
	return <EditField2 parentItem={charity} item={project} path={path} {...stuff} />;
};

const saveDraftFn = _.debounce(
	({path, parentItem}) => {
		if ( ! parentItem) parentItem = DataStore.getValue(path);
		assert(NGO.isa(parentItem), parentItem, path);
		ServerIO.saveCharity(parentItem, 'draft')
		.then((result) => {
			let modCharity = result.cargo;
			assert(NGO.isa(modCharity), modCharity);
			DataStore.setValue(['draft', C.TYPES.Charity, NGO.id(modCharity)], modCharity);
		});
		return true;
	}, 1000);

const EditField2 = (props) => {
	let {item, field, type, help, label, path, parentItem} = props;
	let saveDraftFnWrap = saveDraftFn;
	if (parentItem) {
		saveDraftFnWrap = (context) => {
			context.parentItem = parentItem;
			return saveDraftFn(context);
		};
	}
	// console.log('EditField2', props);
	assMatch(field, String);
	let meta = (item.meta && item.meta[field]) || {};
	return (
		<div>			
			<Misc.Col2>
				<Misc.PropControl label={label || field} type={type} prop={field} 
					path={path} item={item} 
					saveFn={saveDraftFnWrap}
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
