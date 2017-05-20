// @Flow
import React from 'react';
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import {yessy} from 'wwutils';
import { Panel, Image, Well, Label, Grid, Row, Col, Accordion, Glyphicon } from 'react-bootstrap';
import Login from 'you-again';
import HashMap from 'hashmap';

import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../plumbing/DataStore';
import ActionMan from '../../plumbing/ActionMan';
import printer from '../../utils/printer';
import C from '../../C';
import NGO from '../../data/charity/NGO';
import Project from '../../data/charity/Project';
import Misc from '../Misc';

/**
 * @param fn (value, key) -> `false` if you want to stop recursing deeper down this branch. Note: falsy will not stop recursion.
 */
const recurse = function(obj, fn, seen) {
	if ( ! obj) return;
	if (_.isString(obj) || _.isNumber(obj) || _.isBoolean(obj)) {
		return;
	}
	// no loops
	if ( ! seen) seen = new HashMap();
	if (seen.has(obj)) return;
	seen.set(obj, true);

	let keys = Object.keys(obj);
	keys.forEach(k => {
		let v = obj[k];
		if (v===null || v===undefined) {
			return;
		}
		let ok = fn(v, k);
		if (ok === false) return;		
		recurse(v, fn, seen);		
	});
};

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
		let overalls = _.filter(allprojects, p => Project.name(p) === Project.overall);
		let projectProjects = _.filter(allprojects, p => Project.name(p) !== Project.overall);
		// sort by year
		overalls = _.sortBy(overalls, p => - (p.year || 0) );
		projectProjects = _.sortBy(projectProjects, p => - (p.year || 0) );

		let refs = [];
		// TODO once speed issues are resolved (just in case this is the problem)
		// recurse(charity, n => { 
		// 	if ( ! n.source) return null;
		// 	refs.push(n.source);
		// 	return false;
		// });
		let rrefs = refs.map((r,i) => <li key={'r'+i}><Ref reference={r}/></li>);

		// put it together
		console.log("EditCharity", charity);
		return (
			<div className='page EditCharityPage'>				
				<Panel>
					<h2>Editing: {charity.name}</h2>			
						<EditField item={charity} type='checkbox' field='ready' label='Is this data ready for use?' />
						<EditField item={charity} type='text' field='nextAction' label='Next action (if any)' />
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
						<EditField item={charity} field='noPublicDonations' label='No public donations' type='checkbox' 
							help="Tick yes for those rare charities that don't take donations from the general public." />
						<EditField item={charity} field='uk_giftaid' type='checkbox' label='Eligible for UK GiftAid' />
					</Panel>
					<Panel header={<h3>Overall Finances</h3>} eventKey="3">
						<ProjectsEditor charity={charity} projects={overalls} isOverall />
					</Panel>
					<Panel header={<h3>Projects ({projectProjects.length})</h3>} eventKey="4">
						<ProjectsEditor charity={charity} projects={projectProjects} />
					</Panel>
					<Panel header={<h3>References</h3>} eventKey="5">
						<ol>{rrefs}</ol>
					</Panel>
				</Accordion>
			</div>
		);
	}
} // ./EditCharityPage

const ProjectsEditor = ({charity, projects, isOverall}) => {
	assert(NGO.isa(charity));
	if (projects.length===0) {
		return (<div>
			No projects analysed. This is correct for charities which focus on a single overall project.
			<AddProject charity={charity} />
		</div>);
	}
	let rprojects = projects.map((p,i) => <Panel key={'project_'+i} eventKey={i+1} header={<h4>{p.name} {p.year}</h4>}><ProjectEditor charity={charity} project={p} /></Panel>);
	return (<div>
		<Accordion>{rprojects}</Accordion>
		<AddProject charity={charity} isOverall={isOverall} />
	</div>);
};


const AddProject = ({charity, isOverall}) => {
	assert(NGO.isa(charity));
	if (isOverall) {
		return (<div className='form-inline well'>
			<Glyphicon glyph='plus' /> &nbsp;
			<Misc.PropControl prop='year' label='Year' path={['widget','AddProject','form']} type='year' />
			&nbsp;
			<button className='btn btn-default' onClick={() => ActionMan.addProject({charity, isOverall})}>
				<Glyphicon glyph='plus' /> Add Year
			</button>
		</div>);		
	}
	return (<div className='form-inline'>
		<Misc.PropControl prop='name' label='Name' path={['widget','AddProject','form']} />
		&nbsp;
		<Misc.PropControl prop='year' label='Year' path={['widget','AddProject','form']} type='year' />
		&nbsp;
		<button className='btn btn-default' onClick={() => ActionMan.addProject({charity})}>
			<Glyphicon glyph='plus' /> Add Project / Year
		</button>
	</div>);
};

const AddIO = ({list, pio, ioPath}) => {
	assert(_.isArray(list) && _.isArray(ioPath) && pio);
	const formPath = ['widget','AddIO', pio, 'form'];
	const oc = () => ActionMan.addInputOrOutput({list, ioPath, formPath});
	return (<div className='form-inline'>
		<Misc.PropControl prop='name' label='Name' path={formPath} />
		<button className='btn btn-default' onClick={oc}>
			<Glyphicon glyph='plus' />
		</button>
	</div>);
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
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let projectPath = ['draft',C.TYPES.Charity, cid, 'projects', pid];
	let rinputs = project.inputs.map((input, i) => <ProjectInputEditor key={project.name+'-'+i} charity={charity} project={project} input={input} />);
	return (<div className='well'>
		<h5>Inputs</h5>
		<table className='table'>
			<tbody>			
				{rinputs}
			</tbody>
		</table>
		<MetaEditor item={project} field='inputs_meta' itemPath={projectPath} help='Financial data' />
	</div>);
};

const ProjectOutputs = ({charity, project}) => {
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let projectPath = ['draft',C.TYPES.Charity, cid, 'projects', pid];
	// NB: use the array index as key 'cos the other details can be edited
	let rinputs = project.outputs.map((input, i) => <ProjectOutputEditor key={project.name+'-'+i} charity={charity} project={project} output={input} />);
	return (<div className='well'>
		<h5>Outputs</h5>
		<table className='table'>
			<tbody>			
				{rinputs}
				<tr><td colSpan={2}>
					<AddIO pio={'p'+pid+'_output'} list={project.outputs} ioPath={projectPath.concat('outputs')} />
				</td></tr>
			</tbody>
		</table>
		<MetaEditor item={project.outputs} field='outputs_meta' itemPath={projectPath} />
	</div>);
};

const ProjectImpacts = ({charity, project}) => {
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let projectPath = ['draft',C.TYPES.Charity, cid, 'projects', pid];
	let rinputs = project.impacts && project.impacts.map(input => 
		<ProjectImpactEditor key={project.name+'-'+input.name} charity={charity} project={project} impact={input} />);
	return (<div className='well'>
		<h5>Impacts</h5>
		<table className='table'>
			<tbody>			
				<tr><th>&nbsp;</th><th>Unit cost</th><td></td></tr>
				{rinputs}
			</tbody>
		</table>		
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
		<td>
			<Misc.Money amount={costPerBeneficiary} />
			<Misc.PropControl prop='costPerBeneficiary' path={inputPath} item={impact} saveFn={saveDraftFnWrap} />
		</td>
		<td>
			<MetaEditor item={impact} field='all' itemPath={inputPath} />
		</td>
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
				<MetaEditor item={item} itemPath={path} field={field} help={help} />
			</Misc.Col2>
		</div>
	);
};

const MetaEditor = ({item, field, help, itemPath}) => {
	assert(item);
	assert(field, item);
	assert(_.isArray(itemPath), field);
	let meta;
	let metaPath = itemPath.concat(['meta', field]);
	if (_.isArray(item)) {
		meta = {}; // no-meta info on lists -- use a dummy field if you want it
	} else {
		meta = (item.meta && item.meta[field]) || {};
	}
	return (<div className='flexbox'>
		{help? <div>
			<Misc.Icon fa='info-circle' title='Help notes' />
			{help}
		</div> : null}
		<div className='TODO'>
			<Misc.Icon fa='user' title='Last editor' />
			{meta.lastEditor}
		</div>
		<div>
			<MetaEditorItem icon='external-link' title='Information source (preferably a url)' 
							meta={meta} metaPath={metaPath} 
							itemField={field} metaField='source' type='url' />
		</div>
		<div>
			<MetaEditorItem icon='comment-o' title='Notes' meta={meta} metaPath={metaPath} 
							itemField={field} metaField='notes' type='textarea' />
		</div>
	</div>);
};

const MetaEditorItem = ({meta, itemField, metaField, metaPath, icon, title, type}) => {
	assert(meta && itemField && metaField && icon);
	let widgetNotesPath = ['widget', 'EditCharity', 'meta'].concat([itemField, metaField]);
	let ricon = <Misc.Icon fa={icon} title={title} onClick={(e) => DataStore.setValue(widgetNotesPath, true)} />;
	if ( ! DataStore.getValue(widgetNotesPath)) {
		return <div className='MetaEditorItem'>{ricon} {meta[metaField]}</div>;
	}
	// TODO saveFn={saveDraftFnWrap}
	return (<div className='MetaEditorItem'>
				{ricon} 
				<Misc.PropControl label={title} prop={metaField} 
					path={metaPath} 
					item={meta} type={type} />
		</div>);
};

// NB: ref is a react keyword
const Ref = ({reference}) => {
	return <div>{printer.str(reference)}</div>;
};

export default EditCharityPage;

