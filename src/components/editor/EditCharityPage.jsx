// @Flow
import React from 'react';
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import {yessy} from 'wwutils';
import { Panel, Image, Well, Label, Grid, Row, Col, Accordion, Glyphicon } from 'react-bootstrap';
import Login from 'you-again';
import Enum from 'easy-enums';

import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../plumbing/DataStore';
import ActionMan from '../../plumbing/ActionMan';
import printer from '../../utils/printer';
import C from '../../C';
import NGO from '../../data/charity/NGO';
import Project from '../../data/charity/Project';
import Money from '../../data/charity/Money';
import Misc from '../Misc';
import Roles from '../../Roles';
import {LoginLink} from '../LoginWidget/LoginWidget';
import Crud from '../../plumbing/Crud'; //publish
import { ImpactDesc } from '../ImpactWidgetry';

const EditCharityPage = () => {
	if ( ! Login.isLoggedIn()) {
		return <LoginLink />;
	}
	// fetch data
	let cid = DataStore.getUrlValue('charityId');
	let {value:charity} = DataStore.fetch(['data', C.TYPES.NGO, cid], 
		() => ServerIO.getCharity(cid, C.KStatus.DRAFT).then(result => result.cargo)
	);	
	if ( ! charity) {
		return <Misc.Loading />;
	}
	if (C.KStatus.isPUBLISHED(charity.status)) {
		ServerIO.getCharity(cid, C.KStatus.DRAFT)
		.then(res => {
			console.warn("res", res);
			if (res.cargo) DataStore.setData(res.cargo);
		});
	}	

	// projects
	let allprojects = charity.projects || [];
	// split out overall vs projects
	let overalls = _.filter(allprojects, p => Project.name(p) === Project.overall);
	let projectProjects = _.filter(allprojects, p => Project.name(p) !== Project.overall);
	// sort by year
	overalls = _.sortBy(overalls, p => - (p.year || 0) );
	projectProjects = _.sortBy(projectProjects, p => - (p.year || 0) );

	let refs = NGO.getCitations(charity);
	const rrefs = refs.map((r, i) => (
		<li key={'r'+i}>
			<Ref reference={r} />
		</li>
	));

	// put it together
	console.log("EditCharity", charity);
	return (
		<div className='EditCharityPage'>			
			<Panel>
				<h2>Editing: {charity.name}</h2>			
				<p><a href={'/#charity?charityId='+NGO.id(charity)} target='_new'>view profile page</a></p>
				<p>NOTE: Please hover over the <Glyphicon glyph='question-sign' title='question mark' /> icon -- this often includes useful information!</p>
				<EditField item={charity} type='checkbox' field='ready' label='Is this data ready for use?' />
				<EditField item={charity} type='text' field='nextAction' label='Next action (if any)' />
				<Misc.SavePublishDiscard type={C.TYPES.NGO} id={cid} 
					cannotPublish={ ! Roles.iCan(C.CAN.publish).value} 
					cannotDelete={ ! Roles.iCan(C.CAN.publish).value} />
			</Panel>
			<Misc.Card title='Preview: Impact'>
				<ImpactDesc charity={charity} amount={Money.make({value:10, currency:'GBP'})} />
			</Misc.Card>
			<Accordion>
				<Panel header={<h3>Charity Profile</h3>} eventKey="1">
					<ProfileEditor charity={charity} />
				</Panel>
				<Panel header={<h3>Donations &amp; Tax</h3>} eventKey="2">
					<EditField item={charity} 
						field='noPublicDonations' label='No public donations' type='checkbox' 
						help="Tick yes for those rare charities that don't take donations from the general public. Examples include foundations which are simply funded solely from a single source." />
					<EditField item={charity} 
						field={NGO.PROPS.$uk_giftaid()} type='checkbox' label='Eligible for UK GiftAid' 
						help='If the charity has a registration number with Charity Commission of England and Wales or the Scottish equivalent (OSCR) it is certainly eligible.' />
				</Panel>
				<Panel header={<h3>Overall finances and impact</h3>} eventKey="3">
					<ProjectsEditor isOverall charity={charity} projects={overalls} />
				</Panel>
				<Panel header={<h3>Project finances and impact ({projectProjects.length} projects)</h3>} eventKey="4">
					<ProjectsEditor charity={charity} projects={projectProjects} />
				</Panel>
				<Panel header={<h3>Editorial</h3>} eventKey="5">
					<EditorialEditor charity={charity} />
				</Panel>
				<Panel header={<h3>References</h3>} eventKey="6">
					<ol>{rrefs}</ol>
				</Panel>
			</Accordion>
		</div>
	);
}; // ./EditCharityPage


const EditorialEditor = ({charity}) => {
	let rec = charity.recommended;
	return (<div>					
		<EditField item={charity} type='checkbox' field='recommended'
			label='Recommended High-Impact Charity'
			help="Recommended charities are listed above others. They should have a high impact-per-£ ratio, based on reliable data." />
		
		<EditField item={charity} type='select' field='impact'
			options={CONFIDENCE_VALUES.values} 
			label='Overall Impact Rating'
			help="Assuming you agree with the charity's end-goals, how effective is it per-£ at delivering them?"
		/>

		<EditField item={charity} field='confidence' 
			type='select' options={CONFIDENCE_VALUES.values} 
			defaultValue={CONFIDENCE_VALUES.medium} 
			label='Overall Confidence'
			help="How confident are we that the charity will achieve its aims? This is often low for even good lobbying charities." 
		/>

		<EditField item={charity} type='textarea' field='recommendation' 
			label='Recommendation Comment '
			help="A sentence or two on why SoGive recommends (or not) this charity." 
		/>

	</div>);
};


const ProfileEditor = ({charity}) => {
	return (<div>
		<div><small>SoGive ID: {NGO.id(charity)}</small></div>
		<EditField item={charity} disabled type='text' field='name' label='Official name (temporarily locked)' help='The official name, usually as registered with the Charity Commission.' />
		<EditField item={charity} type='text' field='displayName' label='Display name'
			help='This is the name that will be used throughout the SoGive website. It should be the name that people normally use when referring to the charity. If this is the same as the official name, feel free to copy it across (or leaving this field blank is also fine). The name used should be sufficient to differentiate it from any other charity with a similar name. If can be the same as the official name.' />
		
		<EditField label='Parent charity ID' item={charity} type='text'
			field='parentCharity'
			help='Usually blank. The ID of the parent charity, if there is one. Preferably the SoGive ID, but a registration number is OK.' />
		<EditField label='Parent charity name' item={charity} type='text'
			field='parentCharityName'
			help='Usually blank. The name of the parent charity, if there is one.' />

		<div className='well'>
			<p>Registration numbers -- most charities only have one, though international charities may be registered in several regions.</p>
			<EditField label='England &amp; Wales Charity Commission registration number' item={charity} type='text' field='englandWalesCharityRegNum' help='Process to find this: go to the charity website, and scroll to the bottom of the page. 99% of the time, the registration number is stated there.'/>
			<EditField label='Scottish OSCR registration number' item={charity} type='text' field='scotlandCharityRegNum' help='Process to find this: go to the charity website, and scroll to the bottom of the page. 99% of the time, the registration number is stated there.' />
			<EditField label='Northern Ireland registration number' item={charity} type='text' field='niCharityRegNum' help='Process to find this: go to the charity website, and scroll to the bottom of the page. 99% of the time, the registration number is stated there.' />
			<EditField label='UK Companies House number' item={charity} type='text' field='ukCompanyRegNum' help='This often exists for charities, but its not mega-important to gather this if we already have the charity number. Should gathered for (e.g.) social enterprises with no charity number' />
			<EditField label='USA registration number (i.e. EIN)' item={charity} type='text' field='usCharityRegNum' help='Registration number as a 501(c)(3).' />
		</div>

		<EditField item={charity} type='url' field='url' label='Website' />
		<EditField item={charity} type='url' field='wikipedia' label='Wikipedia page' />
		<EditField item={charity} type='textarea' label='Summary description' field='summaryDescription' help='About one sentence long, to be used in search results as a summary. A good source for this is to do a google search for the charity, and the google hits page often shows a brief description' />
		<EditField item={charity} type='textarea' label='Description' field='description' 
			help='A short paragraph, e.g. 2 or 3 sentences. These are used underneath the summary description, so they should add to it and not repeat it.' />
		<div>
			<p>The tags are used for the charity search process. A list of common tags is here: https://docs.google.com/spreadsheets/d/128zX3ic_YoRA0WS1XWZo9-co7A1EmgcVfd_XZBUTx3E</p>
		</div>
		<EditField item={charity} type='text' field='whyTags' label='Why (goal/area) tags' 
			help='What is this charitys cause area? E.g. "education", "poverty", "international aid", or "children". Multiple tags can be comma-separated. Please check the common tags list and use those where possible.' />
		<EditField item={charity} type='text' field='howTags' label='How (method) tags' 
			help='How does the charity work? Unlike the other more freeform tags lists, for this one stick to "Research", "Direct Work", "Campaigning", "Makes grants to organisations". Multiple tags can be comma-separated. ' />
		<EditField item={charity} type='text' field='whereTags' label='Where tags' 
			help='In which countries or areas does the charity give aid? Be willing to enter info at multiple "levels", e.g. for one charity you might enter Hackney, London, United Kingdom or Nairobi, Kenya, Developing World' />

		<EditField item={charity} type='imgUpload' field='logo' help={`Enter a url for the logo image. 
		Preferably choose a logo with no background, or failing that, a white background. If you can't find one like this, then just go with any background.
		One way to get this is to use Google Image search, then visit image, and copy the url. 
		Or find the desired logo on the internet (e.g. from the charity's website). Then right click on the logo and click on "inspect element". 
		Some code should appear on the side of the browser window with a section highlighted. Right-click on the link within the highlighted section and then open this link in a new tab. 
		Copy and paste this URL into this field. 
		Sometimes what looks like an image in your browser is not a valid image url. Please check the preview by this editor to make sure the url works correctly.`} />

		<EditField userFilter='goodloop' item={charity} type='img' field='logo_white' label='White-on-transparent silhouette "poster" logo' />
		<EditField userFilter='goodloop' item={charity} type='color' field='color' label='Brand colour' />
		<EditField userFilter='goodloop' item={charity} type='number' field='circleCrop' label='Circle Crop Factor' max={100} min={0} />
		{Roles.iCan('goodloop').value?
			<div style={{backgroundColor: 'white', borderRadius: '50%', border: '1px solid grey', height: '100px', width: '100px', textAlign: 'center', overflow: 'hidden'}}>
				<img src={charity.logo} style={{height: `${charity.circleCrop || 100}%`, width: `${charity.circleCrop || 100}%`, marginTop: `${(100 - (charity.circleCrop || 100)) / 2}%`, objectFit: 'contain', }} />
			</div>
			: null
		}
		<EditField item={charity} type='imgUpload' field='images' label='Photo' help={`Enter a url for a photo used by the charity to represent its work. 
		This can often be found on the charity's website or in the annual report and accounts. You can find the annual report and accounts  
		Sometimes what looks like an image in your browser is not a valid image url. Please check the preview by this editor to make sure the url works correctly.`} />
		<EditField item={charity} type='text' field='imageCaption' label='Photo caption' />		
		<EditField item={charity} type='textarea' field='stories' label='Story' 
			help='A story from this project, e.g. about a beneficiary. We havent worked out a rule about whether the story and the photo need to relate to each other.' />
			
		<EditField item={charity} field='smallPrint' label='Small print' help='For charities which e.g. like WaterAid have a financial structure which donors must legally be made aware of.' />
		
		<EditField item={charity} type='textarea' field='communicationsWithCharity' label='Communications with the charity' 
				help='Keeping a summary of our efforts to get information from the charity, and their responses. Include dates of messages sent.' />

		<EditField item={charity} type='text' field='externalAssessments' label='External assessments' 
				help='If there are 3rd party impact assessments, e.g. GiveWell, enter the links' />		
	</div>);
}; // ./ProfileEditor


const ProjectsEditor = ({charity, projects, isOverall}) => {
	assert(NGO.isa(charity), 'ProjectsEditor', charity);
	if (projects.length===0) {
		return (<div>
			<p>How does SoGive use projects data?</p>
			<ul>
				<li>There are some charities which do just one thing – single-project charities. For those charities, the projects section can be left blank.</li>
				<li>If the charity does several things, we will use a split of the costs between different projects to understand how the charity allocates its funds between different activities.</li>
				<li>For this to work, it’s important that the list of projects is comprehensive…</li>
				<li>… i.e. if we take each of the projects listed here and add up the spend on each one, it comes to the total amount that the charity has spent on projects (if it excludes some spend which is not directly attributable to direct work – aka overheads – that’s fine because the code automatically takes care of that)</li>
			</ul>
			<AddProject charity={charity} isOverall={isOverall} />
		</div>);
	}
	let repProj = NGO.getProject(charity);
	let rprojects = projects.map((p,i) => (
		<Panel key={'project_'+i} eventKey={i+1} 
			header={<div className={p === repProj? 'bg-success' : ''}><h4 className='pull-left'>{p.name} {p.year}</h4><RemoveProject charity={charity} project={p} /><div className='clearfix'></div></div>}>
			<ProjectEditor charity={charity} project={p} />
		</Panel>)
		);
	return (
		<div>
			<p>How does SoGive use projects data?</p>
			<ul>
				<li>There are some charities which do just one thing – single-project charities. For those charities, the projects section can be left blank.</li>
				<li>If the charity does several things, we will use a split of the costs between different projects to understand how the charity allocates its funds between different activities.</li>
				<li>For this to work, it’s important that the list of projects is comprehensive…</li>
				<li>… i.e. if we take each of the projects listed here and add up the spend on each one, it comes to the total amount that the charity has spent on projects (if it excludes some spend which is not directly attributable to direct work – aka overheads – that’s fine because the code automatically takes care of that)</li>
			</ul>
			<Accordion>{rprojects}</Accordion>
			<AddProject charity={charity} isOverall={isOverall} />
		</div>
	);
};


const AddProject = ({charity, isOverall}) => {
	assert(NGO.isa(charity), "EditCharityPage.AddProject");
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
	assert(NGO.isa(charity), "EditCharityPage.RemoveProject");
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
	assert(_.isArray(list) && _.isArray(ioPath) && pio, "EditCharityPage.AddIO");
	const formPath = ['widget','AddIO', pio, 'form'];
	const oc = () => ActionMan.addInputOrOutput({list, ioPath, formPath});
	let name = DataStore.getValue(formPath.concat('name'));
	
	return (
		<div className='form-inline'>
			<Misc.PropControl prop='name' label='Impact unit / Name' path={formPath} />
			{' '}
			<button className='btn btn-default' onClick={oc} disabled={ ! name}>
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
					<EditProjectField charity={charity} project={project} type='imgUpload' field='image' label='Photo' />
					<EditProjectField charity={charity} project={project} type='text' field='imageCaption' label='Photo caption' />
					<EditProjectField charity={charity} project={project} type='textarea' field='stories' label='Story' 
						help='A story from this project, e.g. about a beneficiary.' />					
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
			<EditProjectField charity={charity} project={project} field='start' label='Year start' 
				type='date'
				help="Year start is Year end minus one year + one day (e.g. if year end is 31 Mar 2016, then year start is 1 Apr 2015). Be careful that the accounts do refer to a period lasting one year – this almost always the case, but in the rare event that it doesn’t apply, then ensure that the period start date noted in this field aligns with that of the accounts you’re looking at" />			
			<EditProjectField charity={charity} project={project} field='end' label='Year end' 
				type='date'
				help='Often stated right at the start of the accounts document. Where it’s not stated right at the start of the document, go to start of the financials, which is generally about halfway through the document.' />

			<ProjectInputs charity={charity} project={project} />
			<ProjectOutputs charity={charity} project={project} />		
			{isOverall? <EditProjectField charity={charity} project={project} type='Money' field='reserves' label='Reserves' /> : null}
	</div>
	);
};

// See and edit the list of data-sources for this project
const ProjectDataSources = ({charity, project}) => {

	const projIndex = charity.projects.indexOf(project);
	const dataSrcPath = ['data', C.TYPES.NGO, NGO.id(charity), 'projects', projIndex, 'data-src'];
	const sourceList = project['data-src'] || [];
	return (
		<div className='well'>
			<h4>Data Sources</h4>
			{ sourceList.map(src => {
				const srcIndex = project['data-src'].indexOf(src);
				const citationPath = dataSrcPath.concat(srcIndex);
				return (
					<ProjectDataSource key={'p'+projIndex+'src'+srcIndex} charity={charity} project={project} citation={src} citationPath={citationPath} />
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
	assert(_.isArray(list) && _.isArray(srcPath) && dataId, "EditCharityPage.AddDataSource");
	const formPath = ['widget','AddDataSource', dataId, 'form'];
	const addSourceFn = () => ActionMan.addDataSource({list, srcPath, formPath});
	return (
		<div className='form-inline'>
			<Misc.PropControl prop='url' label='Add Source URL, then press + button' path={formPath} />
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
	let projectPath = ['data',C.TYPES.NGO, cid, 'projects', pid];
	let annualCosts = project.inputs.find(input => input.name.indexOf('annual') !== -1) || Money.make({name: 'annualCosts'});	
	let projectCosts = project.inputs.find(input => input.name.indexOf('project') !== -1) || Money.make({name: 'projectCosts'});
	let tradingCosts = project.inputs.find(input => input.name.indexOf('trading') !== -1) || Money.make({name: 'tradingCosts'});
	let incomeFromBeneficiaries = project.inputs.find(input => input.name.indexOf('income') !== -1) || Money.make({name: "incomeFromBeneficiaries"});
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
	let projectPath = ['data', C.TYPES.NGO, cid, 'projects', pid];
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
`These are the units in which the impacts are measured, for example "people helped" or "vaccinations performed" or whatever. Be aware that the SoGive code will calculate the amount of impact attributable to a donor, and then append these words after that number (eg wording like "case(s) of malaria averted" would work if you put a number in front, but "reduction in malaria prevalence" wouldn't work). Keep this short, preferably about 2-3 words. 5 words max.
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

- High - the numbers are things the charity can accurately estimate (e.g. malaria nets distributed), and the funding picture is clear, and there has been some independent verification of the figures.   
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
	let inputsPath = ['data',C.TYPES.NGO,cid,'projects', pid, 'inputs'];
	assert(DataStore.getValue(inputsPath) === project.inputs, "EditCharityPage.ProjectInputEditor");
	// where in the list are we?
	let ii = project.inputs.indexOf(input);
	if (ii === -1) {
		project.inputs.push(input);
		ii = project.inputs.indexOf(input);
	}
	assert(ii !== -1, "EditCharityPage.ProjectInputEditor");
	assert(pid !== -1, "EditCharityPage.ProjectInputEditor");
	return (<tr>
		<td>{STD_INPUTS[input.name] || input.name}</td>
		<td>
			{ isOverall || input.name==='projectCosts'? null : <Misc.PropControl label='Manual entry' type='checkbox' prop='manualEntry' path={widgetPath} /> }
			<Misc.PropControl type='Money' prop={ii} path={inputsPath} item={project.inputs} readOnly={readonly} />
		</td>
	</tr>);
};

const CONFIDENCE_VALUES = new Enum("high medium low very-low");

/**
 * Edit output / impact
 */
const ProjectOutputEditor = ({charity, project, output}) => {	
	assert(charity, "EditCharityPage.ProjectOutputEditor not a charity", charity);
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let ii = project.outputs.indexOf(output);
	let inputPath = ['data',C.TYPES.NGO,cid,'projects', pid, 'outputs', ii];
	assert(ii !== -1, "EditCharityPage.ProjectOutputEditor ii="+ii);
	assert(pid !== -1, "EditCharityPage.ProjectOutputEditor pid="+pid);
	assert(DataStore.getValue(inputPath) === output, "EditCharityPage.ProjectOutputEditor output");
	
	let cpb = output? output.costPerBeneficiary : null;
	let cpbraw = output? NGO.costPerBeneficiaryCalc({charity:charity, project:project, output:output}) : null;
	return (<tr>
		<td><Misc.PropControl prop='name' path={inputPath} item={output} /></td>
		<td><Misc.PropControl prop='number' type='number' path={inputPath} item={output} /></td>
		<td>
			<Misc.PropControl prop='costPerBeneficiary' type='Money' path={inputPath} item={output} size={4} />
			<small>Calculated: <Misc.Money amount={cpbraw} /></small>
		</td>
		<td>
			<Misc.PropControl prop='confidence' type='select' options={CONFIDENCE_VALUES.values} 
				defaultValue={CONFIDENCE_VALUES.medium} path={inputPath} item={output}
			/>
		</td>
		<td>
			<Misc.PropControl prop='description' type='textarea'
				path={inputPath} item={output}
			/>
		</td>
		<td>
			<MetaEditor item={output} field='all' itemPath={inputPath} />
		</td>
	</tr>);
};

const EditField = ({item, ...stuff}) => {
	let id = NGO.id(item);
	let path = ['data',C.TYPES.NGO,id];
	return <EditField2 item={item} path={path} {...stuff} />;
};

const EditProjectField = ({charity, project, ...stuff}) => {
	assert(project, "EditCharityPage.EditProjectField: "+stuff);
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	assert(pid!==-1, "EditCharityPage.EditProjectField: "+project);
	let path = ['data',C.TYPES.NGO,cid,'projects', pid];
	return <EditField2 parentItem={charity} item={project} path={path} {...stuff} />;
};

const EditField2 = ({item, field, type, help, label, path, parentItem, userFilter, ...other}) => {
	// some controls are not for all users e.g. goodloop
	if (userFilter) {
		if ( ! Roles.iCan(userFilter).value ) {
			return null;
		}
	}
	// console.log('EditField2', props);
	assMatch(field, "String|Number");

	return (
		<div>			
			<Misc.Col2>
				<Misc.PropControl label={label || field} type={type} prop={field} 
					path={path} item={item} 
					help={help}
					{ ...other}
					/>
				<MetaEditor item={item} itemPath={path} field={field} help={help} />
			</Misc.Col2>
		</div>
	);
};

/**
 * If bar is a primitive node, then foo.bar has meta info stored at foo.meta.bar
 * 
 */
const MetaEditor = ({item, field, help, itemPath, saveFn}) => {
	assert(item, "EditCharityPage.MetaEditor");
	assert(field, "EditCharityPage.MetaEditor: "+item);
	assert(_.isArray(itemPath), "EditCharityPage.MetaEditor: "+field);
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
	assert(meta && itemField && metaField && icon, "EditCharityPage.MetaEditorItem");
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

