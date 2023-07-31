/**
 * COPY PASTA then delete bits from EditCharityPage.jsx
 */
import Enum from 'easy-enums';
import _ from 'lodash';
import React from 'react';
import Login from '../../base/youagain';
import { LoginLink } from '../../base/components/LoginWidget';
import Misc from '../../base/components/Misc';
import PropControl from '../../base/components/PropControl';
import Money from '../../base/data/Money';
import DataStore from '../../base/plumbing/DataStore';
import Roles from '../../base/Roles';
import printer from '../../base/utils/printer';
import C from '../../C';
import NGO from '../../data/charity/NGO2';
import Project from '../../data/charity/Project';
import ActionMan from '../../plumbing/ActionMan';
import ServerIO from '../../plumbing/ServerIO';
import { ImpactDesc } from '../ImpactWidgetry';
import { SuggestedDonationEditor } from './CommonControls';
import { getDataItem } from '../../base/plumbing/Crud';
import { Alert, Button, Row, Col } from 'reactstrap';


const CONFIDENCE_VALUES = new Enum("high medium low very-low");

const CONFIDENCE_LABEL4VALUE = {
	"high": "firm",
	"medium": "tentative",
	"low": "low [not being used]",
	"very-low": "very low [not being used]"
};

/**
 * HACK flag for simple vs advanced editor -- lets us mix in some advanced controls here.
 */
const isAdvanced = () => DataStore.getValue('widget','editor','isAdvanced');

const SimpleEditCharityPage = () => {
	// HACK - see isAdvanced()
	DataStore.setValue(['widget','editor','isAdvanced'], false, false);

	if ( ! Login.isLoggedIn()) {
		return <LoginLink />;
	}
	// fetch data
	const cid = DataStore.getUrlValue('charityId');
	const cpath = DataStore.getDataPath({status:C.KStatus.DRAFT, type:C.TYPES.NGO, id:cid});
	let {value:charity} = getDataItem({id:cid, status:C.KStatus.DRAFT, type:"NGO", noRedirect:true});
	
	if ( ! charity) {
		return <Misc.Loading />;
	}

	// projects
	let allprojects = charity.projects || [];
	// split out overall vs projects
	let overalls = _.filter(allprojects, p => Project.getName(p) === Project.overall);
	let projectProjects = _.filter(allprojects, p => Project.getName(p) !== Project.overall);
	// sort by year
	overalls = _.sortBy(overalls, p => - (p.year || 0) );
	projectProjects = _.sortBy(projectProjects, p => - (p.year || 0) );

	const repProj = NGO.getProject(charity);

	let refs = NGO.getCitations(charity);
	const rrefs = refs.map((r, i) => (
		<li key={'r'+i}>
			<Ref reference={r} />
		</li>
	));

	// check redirect
	const ifRedirect = charity.redirect;
	const RedirectWarning = () => {
		if (ifRedirect) {
			return (
				<div>
					<Alert color="warning">This Charity has a redirection, <b>do not edit this page</b>. <br/> 
						<a className="btn btn-default btn-sm" href={`/#simpleedit?charityId=${escape(ifRedirect)}`} >Click here to edit the redirect target charity</a>
					</Alert>
				</div>
			);
		} else {
			return (
				<div/>
			);
		}
	}

	// put it together
	// console.log("EditCharity", charity);
	return (
		<div className="EditCharityPage">
			<Misc.Card title={'Editing: '+NGO.displayName(charity)}>
				<RedirectWarning />
				<p><a href={`/#charity?charityId=${NGO.id(charity)}`} target="_new">view profile page</a></p>
				<p>NOTE: Please hover over the <Misc.Icon prefix="fa" fa="question-circle" title="question mark" /> icon -- this often includes useful information!</p>
				<div>
					This is the simpler editor. It does not
					include all the possible settings.
					You can switch back-and-forth with the <a href={'/#edit?charityId='+escape(cid)}
						className="btn btn-default btn-sm">Advanced Editor</a>
				</div>

				<EditField item={charity} type="checkbox" field="ready" label="Is this data ready for use?" />
				<EditField item={charity} type="text" field="nextAction" label="Next action (if any)" />
			</Misc.Card>
			<Misc.Card title="Preview: Impact">
				<ImpactDesc charity={charity} amount={new Money({value:10, currency:'GBP'})} />
				<small><ul>
					<li>Representative project: {repProj? repProj.name+' '+repProj.year : "none"} { ! NGO.isReady(charity) && "not-ready"}</li>
					<li>Outputs: {repProj? Project.outputs(repProj).map(o => o.number+" "+o.name) : null}</li>
				</ul></small>
			</Misc.Card>
			<Misc.CardAccordion>
				<Misc.Card title="Charity Profile">
					<ProfileEditor charity={charity} />
				</Misc.Card>

				<Misc.Card title="Donations &amp; Tax">
					<EditField item={charity}
						field={NGO.PROPS.$uk_giftaid()} type="checkbox" label="Eligible for UK GiftAid"
						help="If the charity has a registration number with Charity Commission of England and Wales or the Scottish equivalent (OSCR) it is certainly eligible." />
					<h4>Suggested Donations</h4>
					<Misc.ListEditor path={cpath.concat('suggestedDonations')} ItemEditor={SuggestedDonationEditor} />
				</Misc.Card>

				<Misc.Card title="Overall finances and impact">
					<ProjectsEditor isOverall charity={charity} projects={overalls} />
				</Misc.Card>

				<Misc.Card title={'Project finances and impact ('+projectProjects.length+' projects)'}>
					<ProjectsEditor charity={charity} projects={projectProjects} />
				</Misc.Card>

				<Misc.Card title="Editorial">
					<EditorialEditor charity={charity} />
				</Misc.Card>
				<Misc.Card title="References">
					<ol>{rrefs}</ol>
				</Misc.Card>
			</Misc.CardAccordion>
			<Misc.SavePublishDiscard type={C.TYPES.NGO} id={cid}
					cannotPublish={ ! Roles.iCan(C.CAN.publish).value}
					cannotDelete={ ! Roles.iCan(C.CAN.publish).value} />
		</div>
	);
}; // ./EditCharityPage


const EditorialEditor = ({charity}) => {
	// soft port OLD data
	let rec = charity.recommended;
	if (rec && ! charity.impact) charity.impact = 'high';

	return (<div>
		<EditField item={charity} type="select" field="impact"
			options={C.IMPACT_VALUES.values}
			labels={C.IMPACT_LABEL4VALUE}
			label="Overall Impact Rating"
			help="Assuming you agree with the charity's end-goals, how effective is it per-£ at delivering them? Gold quality charities are listed above others - they should have a high impact-per-£ ratio, based on reliable data."
		/>

		<EditField item={charity} field="confidence"
			type="select"
			options={CONFIDENCE_VALUES.values}
			labels={CONFIDENCE_LABEL4VALUE}
			label="Overall Confidence"
			help="How confident are we that the charity will achieve its aims? This is often low for even good lobbying charities."
		/>

		<EditField item={charity} type="textarea" field="recommendation"
			label="Recommendation Comment "
			help="A sentence or two on why SoGive recommends (or not) this charity."
		/>

		{isAdvanced()? <EditField item={charity} type="checkbox" field="hideImpact"
			label="Hide impact"
			help="If the charity objects to showing impact info, this can be used to hide it on fund-raisers." />
			: null}

	</div>);
};

export const RegNumEditor = ({charity}) => {
	
	let path = charity && DataStore.getDataPath({status:C.KStatus.DRAFT, type:C.TYPES.NGO, id:NGO.id(charity)});

	const addRegNum = () => {
		const regBodyPath = ['widget', 'EditCharity', 'regBody'];
		const regNumPath = ['widget', 'EditCharity', 'regNum'];
		const regBody = DataStore.getValue(regBodyPath);
		const regNum = DataStore.getValue(regNumPath);
		if (regBody && regNum) {
			DataStore.setValue(path.concat(["regNums", regBody]), regNum);
			DataStore.setValue(regBodyPath, "");
			DataStore.setValue(regNumPath, "");
		}
	}

	const deleteRegNum = (regBody) => {
		const regs = DataStore.getValue(path.concat("regNums"));
		delete regs[regBody];
		DataStore.setValue(path.concat("regNums"), regs);
	}

	return <div className="well ml-3">
		<p>Registration numbers -- most charities only have one, though international charities may be registered in several regions.</p>
		{charity.regNums && Object.keys(charity.regNums).map(regBody => <>
			<hr/>
			<Row>
				<Col md={4}>
					<p>{regBody}</p>
				</Col>
				<Col md={4}>
					<PropControl path={path.concat("regNums")} prop={regBody} type="text" inline/>
				</Col>
				<Col md={4}>
					<Button onClick={() => deleteRegNum(regBody)}>x</Button>
				</Col>
			</Row>
		</>)}
		<hr/>
		<PropControl label="Registration body" type="text" path={['widget', 'EditCharity']} prop="regBody"/>
		<PropControl label="Registration number" type="text" path={['widget', 'EditCharity']} prop="regNum"/>
		<Button onClick={addRegNum}>+</Button>
	</div>;
}

const ProfileEditor = ({charity}) => {
	if (charity.category && ! charity.whyTags) {
		charity.whyTags = charity.category;
	}

	return (<div>
		<div><small>SoGive ID: {NGO.id(charity)}</small></div>
		<EditField item={charity} disabled type="text" field="name" label="Official name (locked)" help="The official name, usually as registered with the Charity Commission." />

		<RegNumEditor charity={charity} />

		<EditField item={charity} type="url" field="url" label="Website" />
		<EditField item={charity} type="textarea" label="Summary description" field="summaryDescription" help="About one sentence long, to be used in search results as a summary. A good source for this is to do a google search for the charity, and the google hits page often shows a brief description" />
		<EditField item={charity} type="textarea" label="Description" field="description"
			help="A short paragraph, e.g. 2 or 3 sentences. These are used underneath the summary description, so they should add to it and not repeat it." />
		
		<div>
			<p>The tags are used for the charity search process. A list of common tags is <a href="https://docs.google.com/spreadsheets/d/128zX3ic_YoRA0WS1XWZo9-co7A1EmgcVfd_XZBUTx3E" target="_blank">here</a>.</p>
		</div>
		<EditField item={charity} type="text" field="whyTags" label="Why (goal/area) tags"
			help='What is this charitys cause area? E.g. "education", "poverty", "international aid", or "children". Multiple tags can be comma-separated. Please check the common tags list and use those where possible.' />

		<EditField item={charity} type="text" field="howTags" label="How (method) tags"
			help='How does the charity work? Unlike the other more freeform tags lists, for this one stick to \"Research\", "Direct Work", "Campaigning", "Makes grants to organisations". Multiple tags can be comma-separated.' />
		
		<EditField item={charity} type="text" field="whereTags" label="Where tags, e.g. UK, Africa, developing world"
			help='In which countries or areas does the charity give aid? Be willing to enter info at multiple "levels", e.g. for one charity you might enter Hackney, London, United Kingdom or Nairobi, Kenya, Developing World' />

		<EditField item={charity} type="imgUpload" field="logo" label="Logo" help={`Enter a url for the logo image.
		Preferably choose a logo with no background, or failing that, a white background. If you can't find one like this, then just go with any background.
		One way to get this is to use Google Image search, then visit image, and copy the url.
		Or find the desired logo on the internet (e.g. from the charity's website). Then right click on the logo and click on "inspect element".
		Some code should appear on the side of the browser window with a section highlighted. Right-click on the link within the highlighted section and then open this link in a new tab.
		Copy and paste this URL into this field.
		Sometimes what looks like an image in your browser is not a valid image url. Please check the preview by this editor to make sure the url works correctly.`} />
		
		<EditField item={charity} type="imgUpload" field="altlogo" label="Alternative logo" help="In case the standard logo doesn't work in some cases." />

		<EditField userFilter="goodloop" item={charity} type="color" field="color" label="Charity brand colour" />
		<EditField userFilter="goodloop" item={charity} type="number" field="circleCrop" label="Circle Crop Factor" max={100} min={0} />
		{Roles.iCan('goodloop').value?
			<div style={{backgroundColor: 'white', borderRadius: '50%', border: '1px solid grey', height: '100px', width: '100px', textAlign: 'center', overflow: 'hidden'}}>
				<img src={charity.logo} style={{height: `${charity.circleCrop || 100}%`, width: `${charity.circleCrop || 100}%`, marginTop: `${(100 - (charity.circleCrop || 100)) / 2}%`, objectFit: 'contain', }} />
			</div>
			: null
		}

		<EditField item={charity} type="imgUpload" field="images" label="Photo" help={`Enter a url for a photo used by the charity to represent its work.
		This can often be found on the charity's website or in the annual report and accounts. You can find the annual report and accounts
		Sometimes what looks like an image in your browser is not a valid image url. Please check the preview by this editor to make sure the url works correctly.`} />
	</div>);
}; // ./ProfileEditor


const ProjectsEditor = ({charity, projects, isOverall}) => {
	assert(NGO.isa(charity), 'ProjectsEditor', charity);
	let repProj = NGO.getProject(charity);
	let rprojects = projects.map((p,i) => (
		<Misc.Card key={'project_'+i}
			title={<div><h4 className="pull-left">{p.name} {p.year}</h4> 
				{repProj===p? <span className='text-success'>(representative project)</span>: null} 
				<RemoveProject charity={charity} project={p} /><div className="clearfix" /></div>} 
		>
			<ProjectEditor charity={charity} project={p} />
		</Misc.Card>)
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
			{projects.length? <Misc.CardAccordion>{rprojects}</Misc.CardAccordion> : null}
			<AddProject charity={charity} isOverall={isOverall} />
		</div>
	);
};


const AddProject = ({charity, isOverall}) => {
	assert(NGO.isa(charity), "EditCharityPage.AddProject");
	if (isOverall) {
		return (
			<div className="form-group well">
				<h4>Add Year</h4>
				<p>Create a new annual record</p>
				<PropControl prop="year" label="Year" path={['widget','AddProject','form']} type="year" />
				&nbsp;
				<button className="btn btn-default" onClick={() => ActionMan.addProject({charity, isOverall})}>
					<Misc.Icon fa="plus" /> Add
				</button>
			</div>
		);
	}
	return (
		<div className="form-group well">
			<h4>Add Project/Year</h4>
			<p>Create a new annual project record</p>
			<PropControl prop="name" label="Name" path={['widget','AddProject','form']} />
			&nbsp;
			<PropControl prop="year" label="Year" path={['widget','AddProject','form']} type="year" />
			&nbsp;
			<button className="btn btn-default" onClick={() => ActionMan.addProject({charity})}>
				<Misc.Icon prefix="fas" fa="plus" /> Add
			</button>
		</div>
	);
};


const RemoveProject = ({charity, project}) => {
	assert(NGO.isa(charity), "EditCharityPage.RemoveProject");
	const deleteProject = function(event) {
		event.preventDefault();
		/* eslint-disable no-alert,no-restricted-globals */
		/* global confirm */
		if (confirm("Are you sure you want to delete this project?")) {
			removeProject({charity, project});
		}
		/* eslint-enable no-alert,no-restricted-globals */
	};
	return (
		<button className="btn btn-default btn-sm pull-right"
			title="Delete this project!"
			onClick={deleteProject}
		>
			<Misc.Icon prefix="fas" fa="trash" />
		</button>
	);
};

const removeProject = ({charity, project}) => {
	// TODO a confirm step! DataStore.setShow('confirmDialog', true);
	ActionMan.removeProject({charity, project});
};

/**
 * onClick, `list` is edited directly by ActionMan.addInputOrOutput()!
 * @param {{
 * 	list: Object[],
 * 	ioPath: string[]
 * }}
 */
const AddIO = ({list, pio, ioPath}) => {
	assert(_.isArray(list) && _.isArray(ioPath) && pio, "EditCharityPage.AddIO");
	const formPath = ['widget','AddIO', pio, 'form'];
	const oc = () => ActionMan.addInputOrOutput({list, ioPath, formPath});
	let name = DataStore.getValue(formPath.concat('name'));
	
	return (
		<div className="form-inline">
			<PropControl prop="name" label="Impact unit / Name" path={formPath} />
			{' '}
			<button className="btn btn-default" onClick={oc} disabled={ ! name}>
				<Misc.Icon prefix="fas" fa="plus" />
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
			<EditProjectField charity={charity} project={project} type="checkbox" field="isRep" label="Is this the representative project?"
				help={`This is the project which will be used to "represent" the charity’s impact on the SoGive website/app.
				You may want to fill this in after you have entered the projects (often there is only the overall project, so the decision is easy).
				We aim as far as possible to estimate which project would be the recipient of the marginal extra pound.
				This is hard (maybe impossible?) to do, so we allow other factors (such as confidence in and availability of impact data)
				to influence the choice of representative project too.`} />
			<EditProjectField charity={charity} project={project} type="year" field="year" label="Year"
				help="Which year should we say this is? If the data does not align nicely with a calendar year, typically it would be the year-end" />

			<ProjectInputs charity={charity} project={project} />
			<ProjectOutputs charity={charity} project={project} />
			{isOverall? <EditProjectField charity={charity} project={project} type="Money" field="reserves" label="Reserves" /> : null}
	</div>
	);
};

// See and edit the list of data-sources for this project
const ProjectDataSources = ({charity, project}) => {

	const projIndex = charity.projects.indexOf(project);
	const dataSrcPath = DataStore.getDataPath({status:C.KStatus.DRAFT, type:C.TYPES.NGO, id:NGO.id(charity)})
		.concat(['projects', projIndex, 'data-src']);
	const sourceList = project['data-src'] || [];
	return (
		<div className="well">
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
		<div className="row">
			<div className="col-md-6">
				<PropControl prop="url" label="Source URL" help="The URL at which this citation can be found" path={citationPath} item={citation} saveFn={saveFn} />
			</div>
		</div>
	);
};

const AddDataSource = ({list, dataId, srcPath}) => {
	assert(_.isArray(list) && _.isArray(srcPath) && dataId, "EditCharityPage.AddDataSource");
	const formPath = ['widget','AddDataSource', dataId, 'form'];
	const addSourceFn = () => ActionMan.addDataSource({list, srcPath, formPath});
	return (
		<div className="form-inline">
			<PropControl prop="url" label="Add Source URL, then press + button" path={formPath} />
			{' '}
			<button className="btn btn-default" onClick={addSourceFn}>
				<Misc.Icon prefix="fas" fa="plus" />
			</button>
		</div>
	);
};

/**
 * Project inputs
 */
const ProjectInputs = ({charity, project={}}) => {
	const isOverall = project.name === Project.overall;
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let projectPath = DataStore.getDataPath({status:C.KStatus.DRAFT, type:C.TYPES.NGO, id:cid}).concat(['projects', pid]);
	let inputs = Project.inputs(project);
	let annualCosts = inputs.find(input => input.name && input.name.indexOf('annual') !== -1) || new Money({name: 'annualCosts'});
	let projectCosts = inputs.find(input => input.name && input.name.indexOf('project') !== -1) || new Money({name: 'projectCosts'});
	let tradingCosts = inputs.find(input => input.name && input.name.indexOf('trading') !== -1) || new Money({name: 'tradingCosts'});
	let incomeFromBeneficiaries = inputs.find(input => input.name && input.name.indexOf('income') !== -1) || new Money({name: "incomeFromBeneficiaries"});
	return (<div className="well">
		<h5>Inputs</h5>
		<table className="table">
			<tbody>
				{ ! isOverall? <ProjectInputEditor charity={charity} project={project} input={projectCosts} /> : null}
				<ProjectInputEditor charity={charity} project={project} input={annualCosts} />
				<ProjectInputEditor charity={charity} project={project} input={tradingCosts} />
				<ProjectInputEditor charity={charity} project={project} input={incomeFromBeneficiaries} />
			</tbody>
		</table>
		<MetaEditor item={project} field="inputs_meta" itemPath={projectPath} help="Financial data" />
	</div>);
};


const ProjectOutputs = ({charity, project}) => {
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let projectPath = DataStore.getDataPath({status:C.KStatus.DRAFT, type:C.TYPES.NGO, id:cid}).concat(['projects', pid]);
	return (
		<div className="well">
			<h5>Outputs</h5>
			<table className="table">
				<tbody>
					<tr>
						<th>
							Impact units <Misc.Icon prefix="fas" fa="question-circle" title={
`These are the units in which the impacts are measured, for example "people helped" or "vaccinations performed" or whatever. Be aware that the SoGive code will calculate the amount of impact attributable to a donor, and then append these words after that number (eg wording like "case(s) of malaria averted" would work if you put a number in front, but "reduction in malaria prevalence" wouldn't work). Keep this short, preferably about 2-3 words. 5 words max.
Plurals can be written using a -(s) suffix, or by putting (plural: X) or (singular: X) after the word.
E.g. "malaria net(s)", "child (plural: children)" or "children (singular: child)"`}
							/>
						</th>
						<th>
							Amount <Misc.Icon prefix="fas" fa="question-circle" title={
`Can be left blank for unknown. The best way to find this is usually to start reading the accounts from the start. If you can find the answers in the accounts, do a quick google search to see whether the charity has a separate impact report, and have a look through their website.
${project.name==="overall"? '' : 'Be careful to ensure that the amount shown is relevant to this project.'}`}
							/>
						</th>
						<th>
							Override cost per beneficiary
							<Misc.Icon prefix="fas" fa="question-circle" title="Usually auto-calculated based on the costs and the amount. An override value can be put in here." />
						</th>
						<th>
							Confidence <Misc.Icon prefix="fas" fa="question-circle" title={
`How confident are we in this cost-per-beneficiary estimate?

- High - the numbers are things the charity can accurately estimate (e.g. malaria nets distributed), and the funding picture is clear, and there has been some independent verification of the figures.
- Medium - the default value.
- Low - use this if, for example, you are uncertain about the consistency between the costs and the impact figures, but believe that it's probably not wildly wrong.
- Very low - reasonable chance that it might be wildly wrong. Very Low confidence probably means we shouldn't make this is the representative project, or if we do, we shouldn't mark the charity as finished.`}
							/>
						</th>
						<th>
							Description <Misc.Icon prefix="fas" fa="question-circle" title={
`An optional sentence to explain more about the output. For example, if you said "people helped", you could expand here more about *how* those people were helped.
This is also a good place to point if, for example, the impacts shown are an average across several different projects doing different things.`}
							/>
						</th>
						<th>Meta</th>
					</tr>
					{
						/* NB: use the array index as key 'cos the other details can be edited */
						Project.outputs(project).map(
							(input, i) => <ProjectOutputEditor key={project.name+'-'+i} charity={charity} project={project} output={input} />
						)
					}
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
	tradingCosts: "Trading costs",
	incomeFromBeneficiaries: "Income from Beneficiaries"
};

/**
 * Has two modes:
 * In overall, inputs are always manual entry.
 * Within a project, several inputs are auto-calculated by default.
 *
 * @param input {Money} Must be a named Money
 */
const ProjectInputEditor = ({charity, project, input}) => {
	const isOverall = project.name === Project.overall;
	assert(input.name, "ProjectInputEditor - input MOney must have a name", input);
	// for projects, auto-calc costs based on the % that the project makes up of the overall
	let widgetPath = ['widget', 'ProjectInputEditor', project.name, input.name];
	let manualEntryPath = ['widget', 'ProjectInputEditor', project.name, input.name, 'manualEntry'];
	let manualEntry = isOverall || input.name === 'projectCosts' || DataStore.getValue(manualEntryPath);
	let readonly = ! manualEntry;
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let inputsPath = DataStore.getDataPath({status:C.KStatus.DRAFT, type:C.TYPES.NGO, id:cid}).concat(['projects', pid, 'inputs']);
	{	// sanity check
		const dspi = DataStore.getValue(inputsPath);
		assert( ! dspi || dspi === project.inputs, "EditCharityPage.ProjectInputEditor", inputsPath, dspi, project.inputs);
	}
	// where in the list are we?
	let ii = Project.inputs(project).indexOf(input);
	if (ii === -1) {
		project.inputs.push(input);
		ii = project.inputs.indexOf(input);
	}
	assert(ii !== -1, "EditCharityPage.ProjectInputEditor");
	assert(pid !== -1, "EditCharityPage.ProjectInputEditor");
	const iname = STD_INPUTS[input.name] || input.name;
	return (<tr>
		<td>{iname}</td>
		<td>
			{ isOverall || input.name==="projectCosts"? null : <PropControl label={'Manual entry for '+iname} type="checkbox" prop="manualEntry" path={widgetPath} /> }
			<PropControl type="Money" name={input.name} prop={ii} path={inputsPath} item={project.inputs} readOnly={readonly} />
		</td>
	</tr>);
};


/**
 * Edit output / impact
 */
const ProjectOutputEditor = ({charity, project, output}) => {
	assert(charity, "EditCharityPage.ProjectOutputEditor not a charity", charity);
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	let ii = project.outputs.indexOf(output);
	let inputPath = DataStore.getDataPath({status:C.KStatus.DRAFT, type:C.TYPES.NGO, id:cid}).concat(['projects', pid, 'outputs', ii]);
	assert(ii !== -1, "EditCharityPage.ProjectOutputEditor ii="+ii);
	assert(pid !== -1, "EditCharityPage.ProjectOutputEditor pid="+pid);
	assert(DataStore.getValue(inputPath) === output, "EditCharityPage.ProjectOutputEditor output");

	let cpb = output? output.costPerBeneficiary : null;
	let cpbraw = output? NGO.costPerBeneficiaryCalc({charity:charity, project:project, output:output}) : null;
	return (<tr>
		<td><PropControl prop="name" path={inputPath} item={output} /></td>
		<td><PropControl prop="number" type="number" path={inputPath} item={output} /></td>
		<td>
			<PropControl prop="costPerBeneficiary" type="Money" path={inputPath} item={output} />
			<small>Calculated: <Misc.Money amount={cpbraw} /></small>
		</td>
		<td>
			<PropControl prop="confidence" type="select" options={CONFIDENCE_VALUES.values} path={inputPath} item={output} />
		</td>
		<td>
			<PropControl prop="description" type="textarea"
				path={inputPath} item={output}
			/>
		</td>
		<td>
			<MetaEditor item={output} field="all" itemPath={inputPath} />
		</td>
	</tr>);
};


const EditField = ({item, ...stuff}) => {
	let id = NGO.id(item);
	let path = DataStore.getDataPath({status:C.KStatus.DRAFT, type:C.TYPES.NGO, id});
	return <EditField2 item={item} path={path} {...stuff} />;
};


const EditProjectField = ({charity, project, ...stuff}) => {
	assert(project, "EditCharityPage.EditProjectField: "+stuff);
	let cid = NGO.id(charity);
	let pid = charity.projects.indexOf(project);
	assert(pid!==-1, "EditCharityPage.EditProjectField: "+project);
	let path = DataStore.getDataPath({status:C.KStatus.DRAFT, type:C.TYPES.NGO, id:cid}).concat(['projects', pid]);
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
				<PropControl label={label || field} type={type} prop={field}
					path={path} item={item}
					tooltip={help}
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
	return (<div className="flexbox">
		<div>
			<MetaEditorItem icon="comment-o" title="Notes" meta={meta} metaPath={metaPath}
				itemField={field} metaField="notes" type="textarea"
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
	if (v) ricon = <span className="text-success">{ricon}</span>;
	if ( ! DataStore.getValue(widgetNotesPath)) {
		return <div className="MetaEditorItem">{ricon} {meta[metaField]}</div>;
	}
	return (
		<div className="MetaEditorItem">
			{ricon}
			<PropControl label={title} prop={metaField}
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

export default SimpleEditCharityPage;

export {
	ProjectInputs, ProfileEditor,
	AddProject, RemoveProject, ProjectDataSources, STD_INPUTS,
	AddIO,
	isAdvanced,
	CONFIDENCE_VALUES,
	EditorialEditor
};
