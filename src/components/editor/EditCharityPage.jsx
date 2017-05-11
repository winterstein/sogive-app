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
import Login from 'you-again';

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
						<EditField item={charity} type='checkbox' field='ready' label='Is this data ready for use?' />
						<button onClick={(e) => publishDraftFn(e, charity)} disabled={ ! charity.modified} className='btn btn-primary'>Publish</button> &nbsp;
						<button onClick={(e) => discardDraftFn(e, charity)} disabled={ ! charity.modified} className='btn btn-warning'>Discard Edits</button>
				</Panel>
				<Accordion>
					<Panel header={<h3>Charity Profile</h3>} eventKey="1">
						<div><small>SoGive ID: {NGO.id(charity)}</small></div>
						<EditField item={charity} type='text' field='name' />
						<EditField item={charity} type='text' field='nickname' />
						<EditField item={charity} type='text' field='englandWalesCharityRegNum' />
						<EditField item={charity} type='url' field='url' label='Website' />
						<EditField item={charity} type='text' field='tags' />
						<EditField item={charity} type='textarea' field='description' />
						<EditField item={charity} type='img' field='logo' />
						<EditField item={charity} type='img' field='logo_white' label='White-on-transparent poster logo' />
						<EditField item={charity} type='img' field='images' label='Photo' />
						<EditField item={charity} type='color' field='color' label='Brand colour' />						
					</Panel>
					<Panel header={<h3>Donations &amp; Tax</h3>} eventKey="2">
						<EditField item={charity} field='noPublicDonations' type='checkbox' 
							help="Tick yes for those rare charities that don't takle donations from the general public." />
						<EditField item={charity} field='uk_giftaid' type='checkbox' />
					</Panel>
					<Panel header={<h3>Overall Finances</h3>} eventKey="3">
						<ProjectsEditor charity={charity} projects={overalls} />
					</Panel>
					<Panel header={<h3>Projects ({projectProjects.length})</h3>} eventKey="4">
						<ProjectsEditor charity={charity} projects={projectProjects} />
					</Panel>
					<Panel header={<h3>References</h3>} eventKey="5">
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
	let rinputs = project.inputs.map(input => <ProjectInputEditor key={project.name+'-'+input.name+' '+input.unit} charity={charity} project={project} input={input} />);
	return (<div className='well'>
		<h5>Inputs</h5>
		<table className='table'>
			<tbody>			
				{rinputs}
			</tbody>
		</table>
		<MetaEditor item={project.inputs} />
	</div>);
};

const ProjectOutputs = ({charity, project}) => {
	let rinputs = project.outputs.map(input => <ProjectOutputEditor key={project.name+'-'+input.name+' '+input.unit} charity={charity} project={project} output={input} />);
	return (<div className='well'>
		<h5>Outputs</h5>
		<table className='table'>
			<tbody>			
				{rinputs}
			</tbody>
		</table>
		<MetaEditor item={project.outputs} />
	</div>);
};

const ProjectImpacts = ({charity, project}) => {
	let rinputs = project.impacts.map(input => <ProjectImpactEditor key={project.name+'-'+input.name+' '+input.unit} charity={charity} project={project} impact={input} />);
	return (<div className='well'>
		<h5>Impacts</h5>
		<table className='table'>
			<tbody>			
				{rinputs}
			</tbody>
		</table>
		<MetaEditor item={project.impacts} />
	</div>);
};

const STD_INPUTS = {
	annualCosts: "Annual costs",
	fundraisingCosts: "Fundraising costs",
	tradingCosts: "Trading costs",
	incomeFromBeneficiaries: "Income from Beneficiaries"
};

const ProjectInputEditor = ({charity, project, input}) => {	
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let inputsPath = ['draft',C.TYPES.Charity,cid,'projects', pid, 'inputs'];
	assert(DataStore.getValue(inputsPath) === project.inputs);
	let ii = project.inputs.indexOf(input);
	assert(ii !== -1);
	assert(pid !== -1);
	let saveDraftFnWrap = (context) => {
		context.parentItem = charity;
		return saveDraftFn(context);
	};	
	return (<tr>
		<td>{STD_INPUTS[input.name] || input.name}</td>
		<td><Misc.PropControl type='MonetaryAmount' prop={ii} path={inputsPath} item={project.inputs} saveFn={saveDraftFnWrap} /></td>
	</tr>);
};


const ProjectOutputEditor = ({charity, project, output}) => {	
	assert(charity);
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let ii = project.outputs.indexOf(output);
	let inputPath = ['draft',C.TYPES.Charity,cid,'projects', pid, 'outputs', ii];
	assert(ii !== -1);
	assert(pid !== -1);
	assert(DataStore.getValue(inputPath) === output);
	let saveDraftFnWrap = (context) => {
		context.parentItem = charity;
		return saveDraftFn(context);
	};	
	return (<tr>
		<td><Misc.PropControl prop='name' path={inputPath} item={output} saveFn={saveDraftFnWrap} /></td>
		<td><Misc.PropControl prop='number' path={inputPath} item={output} saveFn={saveDraftFnWrap} /></td>
	</tr>);
};


const ProjectImpactEditor = ({charity, project, impact}) => {	
	assert(charity);
	let ios = 'impacts';
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let ii = project[ios].indexOf(impact);
	let inputPath = ['draft',C.TYPES.Charity,cid,'projects', pid, ios, ii];
	assert(ii !== -1);
	assert(pid !== -1);
	assert(DataStore.getValue(inputPath) === impact);
	let saveDraftFnWrap = (context) => {
		context.parentItem = charity;
		return saveDraftFn(context);
	};	
	let price = 1; //impact.price
	let costPerBeneficiary = 1 / impact.number;
	return (<tr>
		<td><Misc.PropControl prop='name' path={inputPath} item={impact} saveFn={saveDraftFnWrap} /></td>
		<td>{costPerBeneficiary} 
			<Misc.PropControl prop='costPerBeneficiary' path={inputPath} item={impact} saveFn={saveDraftFnWrap} /></td>
	</tr>);
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
	assert(project, stuff);
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	assert(pid!==-1, project);
	let path = ['draft',C.TYPES.Charity,cid,'projects', pid];
	return <EditField2 parentItem={charity} item={project} path={path} {...stuff} />;
};
const EditProjectIOField = ({charity, project, input, output, field, ...stuff}) => {
	assert(charity && project);
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	assert(pid!==-1, project, charity.projects);
	let io; let ioi;
	if (input) {
		io='inputs';
		ioi = project.inputs.indexOf(input);
	} else {
		io='outputs';
		ioi = project.outputs.indexOf(output);
	}
	assert(ioi !== -1);
	let path = ['draft',C.TYPES.Charity,cid,'projects', pid, io, ioi];
	let item = input || output;
	if (field==='this') { 
		// HACK for MonetaryAmount inputs
		path = ['draft',C.TYPES.Charity,cid,'projects', pid, io];
		field = ioi;
		item = project[io];
	}
	return <EditField2 parentItem={charity} item={item} path={path} field={field} {...stuff} />;
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
	assMatch(field, "String|Number");
	return (
		<div>			
			<Misc.Col2>
				<Misc.PropControl label={label || field} type={type} prop={field} 
					path={path} item={item} 
					saveFn={saveDraftFnWrap}
					/>
				<MetaEditor item={item} field={field} help={help} />
			</Misc.Col2>
		</div>
	);
};

const MetaEditor = ({item, field, help, itemPath}) => {
	assert(item, field);
	let meta = (item.meta && item.meta[field]) || {};
	return (<div className='flexbox'>
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
	</div>);
};

export default EditCharityPage;
