// @Flow
import React from 'react';
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import {yessy} from 'wwutils';
import { Panel, Image, Well, Label, Grid, Row, Col, Accordion, Glyphicon } from 'react-bootstrap';
import Login from 'you-again';
import HashMap from 'hashmap';
import Enum from 'easy-enums';

import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../plumbing/DataStore';
import ActionMan from '../../plumbing/ActionMan';
import printer from '../../utils/printer';
import C from '../../C';
import NGO from '../../data/charity/NGO';
import Project from '../../data/charity/Project';
import MonetaryAmount from '../../data/charity/MonetaryAmount';
import Misc from '../Misc';
import Roles from '../../Roles';

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
		ServerIO.getCharity(cid, C.STATUS.DRAFT)
		.then(function(result) {
			let charity = result.cargo;
			assert(NGO.isa(charity), charity);
			DataStore.setValue(['draft', C.TYPES.Charity, cid], charity);
		});
	}

	render() {
		if ( ! Login.isLoggedIn()) {
			return <div>Please login</div>;
		}
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

		let refs = {};
		recurse(charity, node => {
			if (node.source) {
				refs[node.source] = true;
			} else if (node['@type'] === 'Citation' && node.url) {
				refs[node.url] = true;
			} else {
				return null;
			}
			return false;
		});
		// Spread operator turns refs into an array
		const rrefs = Object.entries(refs).map(([r], i) => (
			<li key={'r'+i}>
				<Ref reference={r} />
			</li>
		));

		// put it together
		console.log("EditCharity", charity);
		return (
			<div className='page EditCharityPage'>				
				<Panel>
					<h2>Editing: {charity.name}</h2>			
					<p><a href={'/#charity?charityId='+NGO.id(charity)} target='_new'>view profile page</a></p>
					<p>If you're not sure how to fill out a particular field, hover the <Glyphicon glyph='question-sign' title='question mark' /> icon for a detailed explanation.</p>
					<EditField item={charity} type='checkbox' field='ready' label='Is this data ready for use?' />
					<EditField item={charity} type='text' field='nextAction' label='Next action (if any)' />
					<button onClick={(e) => publishDraftFn(e, charity)} disabled={ ! charity.modified} className='btn btn-primary'>Publish</button> &nbsp;
					<button onClick={(e) => discardDraftFn(e, charity)} disabled={ ! charity.modified} className='btn btn-warning'>Discard Edits</button>
				</Panel>
				<Accordion>
					<Panel header={<h3>Charity Profile</h3>} eventKey="1">
						<ProfileEditor charity={charity} />
					</Panel>
					<Panel header={<h3>Donations &amp; Tax</h3>} eventKey="2">
						<EditField item={charity} field='noPublicDonations' label='No public donations' type='checkbox' 
							help="Tick yes for those rare charities that don't take donations from the general public. Examples include foundations which are simply funded solely from a single source." />
						<EditField item={charity} field='uk_giftaid' type='checkbox' label='Eligible for UK GiftAid' 
							help='If the charity has a registration number with Charity Commission of England and Wales or the Scottish equivalent (OSCR) it is certainly eligible.' />
					</Panel>
					<Panel header={<h3>Overall</h3>} eventKey="3">
						<ProjectsEditor isOverall charity={charity} projects={overalls} />
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


const ProfileEditor = ({charity}) => {
	return (<div>
		<div><small>SoGive ID: {NGO.id(charity)}</small></div>
		<EditField item={charity} disabled type='text' field='name' label='Official name (temporarily locked)' help='The official name, usually as registered with the Charity Commission.' />
		<EditField item={charity} type='text' field='displayName' label='Display name'
			help='This is the name that will be used throughout the SoGive website. It should be the name that people normally use when referring to the charity. If this is the same as the official name, feel free to copy it across (or leaving this field blank is also fine). The name used should be sufficient to differentiate it from any other charity with a similar name. If can be the same as the official name.' />
		
		<div className='well'>
			<p>Registration numbers -- most charities only have one, though international charities may be registered in several regions.</p>
			<EditField label='England &amp; Wales Charity Commission registration number' item={charity} type='text' field='englandWalesCharityRegNum' />
			<EditField label='Scottish OSCR registration number' item={charity} type='text' field='scotlandCharityRegNum' />
			<EditField label='Northern Ireland registration number' item={charity} type='text' field='niCharityRegNum' />
			<EditField label='UK Companies House number' item={charity} type='text' field='ukCompanyRegNum' />
			<EditField label='USA registration number' item={charity} type='text' field='usCharityRegNum' />
		</div>

		<EditField item={charity} type='url' field='url' label='Website' help='Ensure this includes the http:// bit at the start.' />											
		<EditField item={charity} type='textarea' label='Summary description' field='summaryDescription' help='One short sentence, to be used in search results as a summary. A good source for this is to do a google search for the charity, and the google hits page often shows a brief description' />
		<EditField item={charity} type='textarea' label='Description' field='description' 
			help='A short paragraph, e.g. 2 or 3 sentences. These are used underneath the summary description, so they should add to it and not repeat it.' />
		<EditField item={charity} type='location' field='location' label='Location' help="Where in the world does the charity deliver?" />
		<EditField item={charity} type='text' field='whyTags' label='Why (goal/area) tags' 
			help='What does this charity directly tackle? E.g. "education" or "tackling-poverty". Please check the common tags list and use those where possible.' />
		<EditField item={charity} type='text' field='whoTags' label='Who tags' 
			help='What range of people does this charity directly help? E.g. "children". Leave blank for anyone. Please check the common tags list and use those where possible.' />
		<EditField item={charity} type='text' field='howTags' label='How (method) tags' 
			help='How does the charity help? E.g. "training", "medical-supplies", "grants". Please check the common tags list and use those where possible.' />
		<EditField item={charity} type='text' field='whereTags' label='Where tags' 
			help='In which countries or areas does the charity give aid?' />

		<EditField item={charity} type='img' field='logo' help={`Enter a url for the logo image. 
		Preferably choose a logo with no background, or failing that, a white background. If you can't find one like this, then just go with any background.
		One way to get this is to use Google Image search, then visit image, and copy the url. 
		Or find the desired logo on the internet (e.g. from the charitys website). Then right click on the logo and click on "inspect element". 
		Some code should appear on the side of the browser window with a section highlighted. Right-click on the link within the highlighted section and then open this link in a new tab. 
		Copy and paste this URL into this field. 
		Sometimes what looks like an image in your browser is not a valid image url. Please check the preview by this editor to make sure the url works correctly.`} />
		<EditField userFilter='goodloop' item={charity} type='img' field='logo_white' label='White-on-transparent silhouette "poster" logo' />
		<EditField item={charity} type='img' field='images' label='Photo' />
		<EditField item={charity} type='text' field='imageCaption' label='Photo caption' />		
		<EditField item={charity} type='textarea' field='stories' label='Story' help='A story from this project, e.g. about a beneficiary.' />
		<EditField userFilter='goodloop' item={charity} type='color' field='color' label='Brand colour' />						
		
		<EditField item={charity} type='textarea' field='communicationsWithCharity' label='Communications with the charity' 
				help='Keeping a summary of our efforts to get information from the charity, and their responses.' />

		<EditField item={charity} type='text' field='externalAssessments' label='External assessments' />		
	</div>);
}; // ./ProfileEditor


const ProjectsEditor = ({charity, projects, isOverall}) => {
	assert(NGO.isa(charity));
	if (projects.length===0) {
		return (<div>
			No projects analysed. This is correct for charities which focus on a single overall project.
			<AddProject charity={charity} isOverall={isOverall} />
		</div>);
	}
	let rprojects = projects.map((p,i) => (
		<Panel key={'project_'+i} eventKey={i+1} 
			header={<div><h4 className='pull-left'>{p.name} {p.year}</h4><RemoveProject charity={charity} project={p} /><div className='clearfix'></div></div>}>
			<ProjectEditor charity={charity} project={p} />
		</Panel>)
		);
	return (
		<div>
			<p>Please don't mark a charity as "Ready for use" before entering <strong>all</strong> known projects.</p>
			<Accordion>{rprojects}</Accordion>
			<AddProject charity={charity} isOverall={isOverall} />
		</div>
	);
};


const AddProject = ({charity, isOverall}) => {
	assert(NGO.isa(charity));
	if (isOverall) {
		return (
			<div className='form-inline well'>
				<h4>Add Year</h4>
				<p>Create a new annual record</p>
				<Misc.PropControl prop='year' label='Year' path={['widget','AddProject','form']} type='year' />
				&nbsp;
				<button className='btn btn-default' onClick={() => ActionMan.addProject({charity, isOverall})}>
					<Glyphicon glyph='plus' /> Add
				</button>
			</div>
		);		
	}
	return (
		<div className='form-inline well'>
			<h4>Add Project/Year</h4>
			<p>Create a new annual project record</p>
			<Misc.PropControl prop='name' label='Name' path={['widget','AddProject','form']} />
			&nbsp;
			<Misc.PropControl prop='year' label='Year' path={['widget','AddProject','form']} type='year' />
			&nbsp;
			<button className='btn btn-default' onClick={() => ActionMan.addProject({charity})}>
				<Glyphicon glyph='plus' /> Add
			</button>
		</div>
	);
};


const RemoveProject = ({charity, project}) => {
	assert(NGO.isa(charity));
	const deleteProject = function(event) {
		event.preventDefault();
		if (confirm("Are you sure you want to delete this project?")) {
			removeProject({charity, project});
		}
	};
	return (
		<button className='btn btn-default btn-sm pull-right' 
			title='Delete this project!'
			onClick={deleteProject}
		>
			<Glyphicon glyph='trash' />
		</button>
	);
};

const removeProject = ({charity, project}) => {
	// TODO a confirm step! DataStore.setShow('confirmDialog', true);
	ActionMan.removeProject({charity, project});
};

const AddIO = ({list, pio, ioPath}) => {
	assert(_.isArray(list) && _.isArray(ioPath) && pio);
	const formPath = ['widget','AddIO', pio, 'form'];
	const oc = () => ActionMan.addInputOrOutput({list, ioPath, formPath});

	return (
		<div className='form-inline'>
			<Misc.PropControl prop='name' label='Impact unit / Name' path={formPath} />
			{' '}
			<button className='btn btn-default' onClick={oc}>
				<Glyphicon glyph='plus' />
			</button>
		</div>
	);
};


const ProjectEditor = ({charity, project}) => {
	// story image as well as project image??
	// Projects have stories and images. Overall finances dont need, as they have the overall charity bumpf
	const isOverall = Project.isOverall(project);

	return (
		<div>
			<ProjectDataSources charity={charity} project={project} />
			{isOverall? null : (
				<div>
					<EditProjectField charity={charity} project={project} type='textarea' field='description' label='Description' />
					<EditProjectField charity={charity} project={project} type='img' field='image' label='Photo' />
					<EditProjectField charity={charity} project={project} type='text' field='imageCaption' label='Photo caption' />
					<EditProjectField charity={charity} project={project} type='textarea' field='stories' label='Story' help='A story from this project, e.g. about a beneficiary.' />
				</div>
			)}
			<EditProjectField charity={charity} project={project} type='checkbox' field='isRep' label='Is this the representative project?'
				help={`This is the project which will be used to "represent" the charity’s impact on the SoGive website/app. 
				You may want to fill this in after you have entered the projects (often there is only the overall project, so the decision is easy). 
				We aim as far as possible to estimate which project would be the recipient of the marginal extra pound. 
				This is hard (maybe impossible?) to do, so we allow other factors (such as confidence in and availability of impact data) 
				to influence the choice of representative project too.`} />			
			<EditProjectField charity={charity} project={project} type='year' field='year' label='Year'
				help='Which year should we say this is? If the data does not align nicely with a calendar year, typically it would be the year-end' />
			<EditProjectField charity={charity} project={project} type='date' field='start' label='Year start' 
				help='Year start is Year end minus one year + one day (e.g. if year end is 31 Mar 2016, then year start is 1 Apr 2015). Be careful that the accounts do refer to a period lasting one year – this almost always the case, but in the rare event that it doesn’t apply, then ensure that the period start date noted in this field aligns with that of the accounts you’re looking at' />
			<EditProjectField charity={charity} project={project} type='date' field='end' label='Year end' 
				help='Often stated right at the start of the accounts document. Where it’s not stated right at the start of the document, go to start of the financials, which is generally about halfway through the document.' />
			
			<ProjectInputs charity={charity} project={project} />
			<ProjectOutputs charity={charity} project={project} />		
	</div>
	);
			// <ProjectImpacts charity={charity} project={project} />
};

// See and edit the list of data-sources for this project
const ProjectDataSources = ({charity, project}) => {
	let saveDraftFnWrap = (context) => {
		context.parentItem = charity;
		return saveDraftFn(context);
	};
	const projIndex = charity.projects.indexOf(project);
	const dataSrcPath = ['draft', C.TYPES.Charity, NGO.id(charity), 'projects', projIndex, 'data-src'];
	const sourceList = project['data-src'] || [];
	return (
		<div className='well'>
			<h4>Data Sources</h4>
			{ sourceList.map(src => {
				const srcIndex = project['data-src'].indexOf(src);
				const citationPath = dataSrcPath.concat(srcIndex);
				return (
					<ProjectDataSource key={'p'+projIndex+'src'+srcIndex} charity={charity} project={project} citation={src} citationPath={citationPath} saveFn={saveDraftFnWrap} />
				);
			}) }
			<AddDataSource dataId={'p'+projIndex+'data-src'} list={sourceList} srcPath={dataSrcPath} />
		</div>
	);
};

const ProjectDataSource = ({charity, project, citation, citationPath, saveFn}) => {
	return (
		<div className='row'>
			<div className='col-md-6'>
				<Misc.PropControl prop='url' label='Source URL' help='The URL at which this citation can be found' path={citationPath} item={citation} saveFn={saveFn} />
			</div>
		</div>
	);
};

const AddDataSource = ({list, dataId, srcPath}) => {
	assert(_.isArray(list) && _.isArray(srcPath) && dataId);
	const formPath = ['widget','AddDataSource', dataId, 'form'];
	const addSourceFn = () => ActionMan.addDataSource({list, srcPath, formPath});
	return (
		<div className='form-inline'>
			<Misc.PropControl prop='url' label='Add Source URL' path={formPath} />
			{' '}
			<button className='btn btn-default' onClick={addSourceFn}>
				<Glyphicon glyph='plus' />
			</button>
		</div>
	);
};

/**
 * Project inputs
 */
const ProjectInputs = ({charity, project}) => {
	const isOverall = project.name === Project.overall;
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let projectPath = ['draft',C.TYPES.Charity, cid, 'projects', pid];
	let annualCosts = project.inputs.find(input => input.name.indexOf('annual') !== -1) || MonetaryAmount.make({name: 'annualCosts'});	
	let projectCosts = project.inputs.find(input => input.name.indexOf('project') !== -1) || MonetaryAmount.make({name: 'projectCosts'});
	let tradingCosts = project.inputs.find(input => input.name.indexOf('trading') !== -1) || MonetaryAmount.make({name: 'tradingCosts'});
	let incomeFromBeneficiaries = project.inputs.find(input => input.name.indexOf('income') !== -1) || MonetaryAmount.make({name: "incomeFromBeneficiaries"});
	return (<div className='well'>
		<h5>Inputs</h5>
		<table className='table'>
			<tbody>			
				{ ! isOverall? <ProjectInputEditor charity={charity} project={project} input={projectCosts} /> : null}
				<ProjectInputEditor charity={charity} project={project} input={annualCosts} />
				<ProjectInputEditor charity={charity} project={project} input={tradingCosts} />
				<ProjectInputEditor charity={charity} project={project} input={incomeFromBeneficiaries} />
			</tbody>
		</table>
		<MetaEditor item={project} field='inputs_meta' itemPath={projectPath} help='Financial data' />
	</div>);
};


const ProjectOutputs = ({charity, project}) => {
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let projectPath = ['draft', C.TYPES.Charity, cid, 'projects', pid];
	// NB: use the array index as key 'cos the other details can be edited
	let rinputs = project.outputs.map((input, i) => <ProjectOutputEditor key={project.name+'-'+i} charity={charity} project={project} output={input} />);
	return (
		<div className='well'>
			<h5>Outputs</h5>
			<table className='table'>
				<tbody>			
					<tr>
						<th>
							Impact units <Glyphicon glyph='question-sign' title={
`These are the units in which the impacts are measured, for example "people helped" or "vaccinations performed" or whatever. Keep this short, preferably about 2-3 words. 5 words max.
Plurals can be written using a -(s) suffix, or by putting (plural: X) or (singular: X) after the word.
E.g. "malaria net(s)", "child (plural: children)" or "children (singular: child)"`}
							/>
						</th>
						<th>
							Amount <Glyphicon glyph='question-sign' title={
`Can be left blank for unknown. The best way to find this is usually to start reading the accounts from the start. If you can find the answers in the accounts, do a quick google search to see whether the charity has a separate impact report, and have a look through their website.
${project.name==='overall'? '' : 'Be careful to ensure that the amount shown is relevant to this project.'}`}
							/>
						</th>
						<th>
							Override cost per beneficiary <Glyphicon glyph='question-sign' title={
								`Usually auto-calculated based on the costs and the amount. An override value can be put in here.`}
							/>
						</th>
						<th>
							Confidence <Glyphicon glyph='question-sign' title={
`How confident are we in this cost-per-beneficiary estimate?   

- High - the numbers are things the charity can accurately estimate (e.g. malaria nets distributed), and the funding picture is clear.   
- Medium - the default value.    
- Low - use this if, for example, you are uncertain about the consistency between the costs and the impact figures, but believe that it's probably not wildly wrong.    
- Very low - reasonable chance that it might be wildly wrong. Very Low confidence probably means we shouldn't make this is the representative project, or if we do, we shouldn't mark the charity as finished.`}
							/>
						</th>
						<th>
							Description <Glyphicon glyph='question-sign' title={
`An optional sentence to explain more about the output. For example, if you said "people helped", you could expand here more about *how* those people were helped. 
This is also a good place to point if, for example, the impacts shown are an average across several different projects doing different things.`}
							/>
						</th>
						<th>Meta</th>
					</tr>
					{rinputs}
					<tr><td colSpan={6}>
						<AddIO pio={'p'+pid+'_output'} list={project.outputs} ioPath={projectPath.concat('outputs')} />
					</td></tr>
				</tbody>
			</table>		
		</div>
	);
}; // ./ProjectOutputs()

const STD_INPUTS = {
	projectCosts: "Project costs",
	annualCosts: "Annual costs",
	fundraisingCosts: "Fundraising costs",
	tradingCosts: "Trading costs",
	incomeFromBeneficiaries: "Income from Beneficiaries"
};

/**
 * Has two modes:
 * In overall, inputs are always manual entry.
 * Within a project, several inputs are auto-calculated by default.
 */
const ProjectInputEditor = ({charity, project, input}) => {	
	const isOverall = project.name === Project.overall;
	// for projects, auto-calc costs based on the % that the project makes up of the overall
	let widgetPath = ['widget', 'ProjectInputEditor', project.name, input.name];
	let manualEntryPath = ['widget', 'ProjectInputEditor', project.name, input.name, 'manualEntry'];
	let manualEntry = isOverall || input.name === 'projectCosts' || DataStore.getValue(manualEntryPath);
	let readonly = ! manualEntry;
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let inputsPath = ['draft',C.TYPES.Charity,cid,'projects', pid, 'inputs'];
	assert(DataStore.getValue(inputsPath) === project.inputs);
	// where in the list are we?
	let ii = project.inputs.indexOf(input);
	if (ii === -1) {
		project.inputs.push(input);
		ii = project.inputs.indexOf(input);
	}
	assert(ii !== -1);
	assert(pid !== -1);
	let saveDraftFnWrap = (context) => {
		context.parentItem = charity;
		return saveDraftFn(context);
	};
	return (<tr>
		<td>{STD_INPUTS[input.name] || input.name}</td>
		<td>
			{ isOverall || input.name==='projectCosts'? null : <Misc.PropControl label='Manual entry' type='checkbox' prop='manualEntry' path={widgetPath} /> }
			<Misc.PropControl type='MonetaryAmount' prop={ii} path={inputsPath} item={project.inputs} saveFn={saveDraftFnWrap} readOnly={readonly} />
		</td>
	</tr>);
};

const CONFIDENCE_VALUES = new Enum("high medium low very-low");

/**
 * Edit output / impact
 */
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
	let cpb = output.costPerBeneficiary;
	let cpbraw = NGO.costPerBeneficiaryCalc({charity:charity, project:project, output:output});
	return (<tr>
		<td><Misc.PropControl prop='name' path={inputPath} item={output} saveFn={saveDraftFnWrap} /></td>
		<td><Misc.PropControl prop='number' path={inputPath} item={output} saveFn={saveDraftFnWrap} /></td>
		<td>
			<Misc.PropControl prop='costPerBeneficiary' type='MonetaryAmount' path={inputPath} item={output} saveFn={saveDraftFnWrap} />
			<small>Calculated: <Misc.Money amount={cpbraw} /></small>
		</td>
		<td>
			<Misc.PropControl prop='confidence' type='select' options={CONFIDENCE_VALUES.values} 
				defaultValue={CONFIDENCE_VALUES.medium} path={inputPath} item={output} saveFn={saveDraftFnWrap}
			/>
		</td>
		<td>
			<Misc.PropControl prop='description' type='textarea'
				path={inputPath} item={output} saveFn={saveDraftFnWrap}
			/>
		</td>
		<td>
			<MetaEditor item={output} field='all' itemPath={inputPath} />
		</td>
	</tr>);
};


const publishDraftFn = _.throttle((e, charity) => {
	ServerIO.publish(charity, C.STATUS.DRAFT);
}, 250);
const discardDraftFn = _.throttle((e, charity) => {
	ServerIO.discardEdits(charity);
	window.location.reload();
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
		ServerIO.saveCharity(parentItem, C.STATUS.DRAFT)
		.then((result) => {
			let modCharity = result.cargo;
			assert(NGO.isa(modCharity), modCharity);
			DataStore.setValue(['draft', C.TYPES.Charity, NGO.id(modCharity)], modCharity);
		});
		return true;
	}, 1000);

const EditField2 = ({item, field, type, help, label, path, parentItem, userFilter, ...other}) => {
	// some controls are not for all users
	if (userFilter) {
		if ( ! Roles.iCan(userFilter)) {
			return null;
		}
	}
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
					help={help}
					{ ...other}
					/>
				<MetaEditor item={item} itemPath={path} field={field} help={help} saveFn={saveDraftFnWrap} />
			</Misc.Col2>
		</div>
	);
};

/**
 * If bar is a primitive node, then foo.bar has meta info stored at foo.meta.bar
 * 
 */
const MetaEditor = ({item, field, help, itemPath, saveFn}) => {
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
		<div className='TODO'>
			<Misc.Icon fa='user' title='Last editor' />
			{meta.lastEditor}
		</div>
		<div>
			<MetaEditorItem icon='external-link' title='Information source (preferably a url)'
				meta={meta} metaPath={metaPath} 
				itemField={field} metaField='source' type='url'
				saveFn={saveFn}
			/>
		</div>
		<div>
			<MetaEditorItem icon='comment-o' title='Notes' meta={meta} metaPath={metaPath}
				itemField={field} metaField='notes' type='textarea'
				saveFn={saveFn}
			/>
		</div>
	</div>);
};

const MetaEditorItem = ({meta, itemField, metaField, metaPath, icon, title, type, saveFn}) => {
	assert(meta && itemField && metaField && icon);
	let widgetNotesPath = ['widget', 'EditCharity', 'meta'].concat([itemField, metaField]);
	// icon with click->open behaviour
	let ricon = <Misc.Icon fa={icon} title={title} onClick={(e) => DataStore.setValue(widgetNotesPath, true)} />;
	let v = meta[metaField];
	// green if set
	if (v) ricon = <span className='text-success'>{ricon}</span>;
	if ( ! DataStore.getValue(widgetNotesPath)) {
		return <div className='MetaEditorItem'>{ricon} {meta[metaField]}</div>;
	}
	return (
		<div className='MetaEditorItem'>
			{ricon} 
			<Misc.PropControl label={title} prop={metaField}
				path={metaPath}
				item={meta} type={type}
				saveFn={saveFn}
			/>
		</div>
	);
};

// NB: ref is a react keyword
const Ref = ({reference}) => {
	return <div>{printer.str(reference)}</div>;
};

export default EditCharityPage;

