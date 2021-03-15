// @Flow
import React from 'react';
import _ from 'lodash';
import Login from '../base/youagain';
import { Button, Col, Label, Modal, ModalHeader, ModalBody } from 'reactstrap';
import {yessy } from '../base/utils/miscutils';
import { PieChart } from 'react-minimal-pie-chart';

import printer from '../base/utils/printer';
import DataStore from '../base/plumbing/DataStore';

import MDText from '../base/components/MDText';
import {CreateButton} from '../base/components/ListLoad';
import Misc from '../base/components/Misc';
import { Tabs, Tab } from '../base/components/Tabs';

import C from '../C';
import ActionMan from '../plumbing/ActionMan';
import NGO from '../data/charity/NGO2';
import Project from '../data/charity/Project';
import Output from '../data/charity/Output';
import Citation from '../data/charity/Citation';

import ImpactCalculator from './ImpactCalculator';
import SocialShare from './SocialShare';
import { DonateButton } from './DonationWizard';


const InfoColumn = ({charity}) => (
	<Col md="4" xs="12" className="column info-column">
		
		<CharityAbout charity={charity} />
	</Col>
);


const CharityPage = () => {
	// fetch data
	let cid = DataStore.getUrlValue('charityId');
	if ( ! cid) cid = DataStore.getValue('location', 'path')[1]; // TODO switch to this more RESTful path naming as the standard
	let status = DataStore.getUrlValue('status') || C.KStatus.PUBLISHED;
	let pvCharity = ActionMan.getDataItem({status, type:C.TYPES.$NGO(), id:cid});
	let charity = pvCharity.value;
	if ( ! charity) {
		return <Misc.Loading pv={pvCharity} />;
	}

	const impactColumn = (
		<Col md="7" xs="12" className="column impact-column">
			<div className="header">
				{charity.logo? <div><img src={charity.logo} alt='Charity logo' className='charity-logo'/></div> : null}
				<h1 className="header-title">
					{charity.displayName || charity.name} <small><EditLink charity={charity} /></small>
				</h1>
				<div className='div-section-text description-short'>
					{charity.summaryDescription? <MDText source={charity.summaryDescription} /> : null}
				</div>
				<RatingBadgeandDonate charity={charity} />
				<LearnAboutRatingsModal />
				{charity.whyTags? <CharityTags whyTagsString={charity.whyTags} whereTagsString={charity.whereTags} /> : null}
			</div>
			<ImpactCalculatorSection charity={charity} />
			{/* {charity.summaryDescription || charity.description ? <CharityAboutSection charity={charity} /> : null} */}
			{charity.recommendation? <CharityAnalysisSection charity={charity} /> : null}
		</Col>
	);
	const spacerColumn = <Col md="1" xs="hidden" />;

	return (
		<div>
			<div className='charity-page row'>
				{impactColumn}
				{spacerColumn}
				<InfoColumn charity={charity} />
			</div>
		</div>
	);
}; // ./CharityPage

const RatingBadgeandDonate = ({charity}) => {
	const label = C.IMPACT_LABEL4VALUE[charity.impact];
	let ratingIconPath = '/img/rating-' + charity.impact + '.svg';

	return (
		<div className="container impact">
			{charity.impact ? <img className="mr-4" alt={label} src={ratingIconPath}/> : <img alt='Not yet rated' src='/img/not-yet-rated.svg'/>}
			<DonateButton item={charity}/>
		</div>
	)
}

const CharityTags = ({whyTagsString = '', whereTagsString = ''}) => (
	// TODO <a href={'/#search?q=tag:'+encURI(tag)}> -- needs server-side support
	<div className={'tags'}>
		Tags: {whyTagsString.toLocaleLowerCase()}, {whereTagsString.toLocaleLowerCase()}
	</div>
);

const ImpactCalculatorSection = ({charity}) => (
	<div>
		<h2 className="header-section-title">
			Impact Calculator
		</h2>
		<ImpactCalculator charity={charity} />
	</div>
);

const CharityAboutSection = ({charity}) => (
	<div>
			<div className="header">
				<h2 className="header-section-title">
					About {charity.displayName || charity.name}
				</h2>
			</div>
			<div className='div-section-text'>
					{charity.summaryDescription? <MDText source={charity.summaryDescription} /> : null}
					{charity.description? <MDText source={charity.description} /> : null}
			</div>
	</div>
);

const CharityAnalysisSection = ({charity}) => (
	<div>
		<div className="header">
			<h2 className="header-section-title">Our Analysis</h2>
		</div>
		<RatingBadgeandDonate charity={charity} />
		<div className="div-section-text">
			<MDText source={charity.recommendation} />
		</div>
	</div>
);

//this function gets project data of a certain charity and returns on object containing project data, total project value and the year its from
//project data is in this format because of the pie chart package
const getProjectData = (charity) => {
	let  outputarray = []
	// Sort all projects by year, descending, and filter out other years
	let programSplit = charity.projects.sort((a,b) => {
		if (a.year > b.year) return -1;
		if (a.year < b.year) return 1;
		return 0;
	})
	let mostRecentYear = programSplit[0].year;
	programSplit = programSplit.filter(proj =>  proj.year === mostRecentYear)
	let i = 0;
	
	programSplit.map((obj) => {
		const colours = ["#27AE60", "#F2994A", "#2D9CDB", "#C32DDB", "#F24A4F"]
		
		if (obj.inputs.findIndex(elem => elem.name === "projectCosts") !== -1) {
			i = outputarray.length
			if (i >= colours.length) i = outputarray.length % colours.length; //limiting colours to only those in the array
			let insert = {
				color: colours[i],
				title: obj.name,
				value: obj.inputs[obj.inputs.findIndex(elem => elem.name === "projectCosts")].value,
			};
			if (insert.value) outputarray.push(insert);
		}
	});
	const returnObj = {};
	returnObj.totalProjectValue = outputarray.reduce((acc, elem) => acc + Number(elem.value), 0);
	returnObj.year = mostRecentYear;
	returnObj.data = outputarray;
	return returnObj;
}

const CharityAbout = ({charity}) => {
	// Safety: in case the url is e.g. wwww.mysite.com with no http(s)
	let churl = charity.url;
	if (churl && churl.indexOf('http') !== 0) churl = 'http://'+churl;
	
	return (
		<div className='charity-about'>
			{/* {NGO.getName(charity) !== NGO.displayName(charity)? <h4 className='official-name'>{NGO.getName(charity)}</h4> : null} */}
			<CharityAboutImage charity={charity} />
			<div className='charity-about-details div-section-text std-border std-box-shadow '>
				<h3 className='header-section-title'><b>Details on {NGO.displayName(charity)}</b></h3>
				<p><b>Website:</b> <a href={churl} target='_blank'>{charity.url}</a></p>
				{NGO.registrationNumbers(charity).map(reg => <p key={reg.id}><b>{reg.regulator}</b>: {reg.id}</p>)}
				<ProgramSplit charity={charity} />
			</div>
		</div>
	);
};

const ProgramSplit = ({charity}) => {
	let pieChartData = [];
	let totalProjectValue = 0;
	let mostRecentProjectYear;
	

	if (charity.projects !== undefined) {
		const projectData = getProjectData(charity);
		totalProjectValue = projectData.totalProjectValue;
		if (projectData.data.length > 0) {
			mostRecentProjectYear = ` (${projectData.year})`;
			pieChartData = projectData.data
		}
	}

	return (
		<>
		{pieChartData.length > 1? 
			<>
			<p><b>Program Split{mostRecentProjectYear}:</b></p>
			<ul>
				{pieChartData.map(prog => <li key={prog.title} style= {{'color': prog.color}}>{prog.title} - {Math.round(Number(prog.value) * 100/totalProjectValue)}%</li>)}
			</ul>
			<PieChart
				data={pieChartData}
				label={({ dataEntry }) => Math.round(dataEntry.percentage) + '%'}
				labelStyle={(index) => ({
					fill: pieChartData[index].color,
					fontSize: '4px',
					fontFamily: 'Tajawal',
				})}
				radius={40}
				labelPosition={105}
				/>
			</>
			:<></>
		}
		</>
	)
}


const CharityAboutImage = ({charity}) => {
	if ( ! NGO.image(charity) && ! charity.logo) return null;
	return (<div className='images'>
		{NGO.image(charity)? <div className='charity-image'>
			<img src={NGO.image(charity)} alt='Charity' />
		</div> : null}

	</div>);
};

/**
 * The charity extra tab
 */
const CharityExtra = ({charity}) => {
	if ( ! charity) return null;
	
	// const projectsByYear = {};
	// (charity.projects).forEach(project => {
	// 	const projectsForYear = projectsByYear[project.year] || [];
	// 	if (Project.isOverall(project)) {
	// 		projectsForYear.unshift(project);
	// 	} else {
	// 		projectsForYear.push(project);
	// 	}
	// 	projectsByYear[project.year] = projectsForYear;
	// });

	// const yearDivs = Object.keys(projectsByYear).sort().reverse().map(year => (
	// 	<CharityExtraYear key={year} year={year} projects={projectsByYear[year]} />
	// ));

	let refs = NGO.getCitations(charity);

	// // hide extra-info from most users -- only senior editors and admins
	// let showProjectInfo = Roles.iCan(C.CAN.publish).value;
	// {showProjectInfo? yearDivs : null}

	return (
		<div className='charity-extra'>
			<Quote text={charity.recommendation} />
			{refs.length? <Citations citations={refs} /> : null}
			<p>Join the SoGive team as a volunteer editor to help us turn charity reporting into meaningful impact models.</p>
		</div>
	);
};

const Citations = ({citations}) => (
	<div className='citations'>
		<h3>Sources</h3>
		<ol>
			{citations.map((ref,i) => <Cite i={i} key={i} citation={ref} />)}
		</ol>
	</div>
);

const Cite = ({citation, i}) => {
	return (<li>
		<a href={Citation.url(citation)} target='_blank'>{Citation.url(citation)}</a>
	</li>);
};

const CharityExtraYear = ({year, projects}) => {
	if (!year || !projects || !projects.length) return null;
	const projectDivs = projects.map(
		project => <CharityExtraProject key={project.name} project={project} showTitle={projects.length > 1} />
	);
	return (
		<div>
			{ isNaN(year) ? '' : <h2>{year}</h2> }
			{projectDivs}
		</div>
	);
};


/** Markdown swallows single line breaks - but normal people processing text don't expect this!
Using a regex to normalise all strings of CRs to \n\n before sending to printer so the story formatting behaves more intuitively for now. */
const Quote = ({text}) => {
	if ( ! text || ! text.replace) return null;
	return (
		<div className='quote'>
			<span className='quote-marks fa fa-quote-left' />
			<MDText source={text} />
			<span className='quote-marks fa fa-quote-right' />
		</div>
	);
};

const CharityExtraProject = ({project, showTitle}) => {
	if ( ! project) return null;
	const {inputs, outputs} = project;
	return (
		<div className='extra-project'>
			{ showTitle ? <h3 className='project-name'>{project.name}</h3> : null }
			{ project.images ? <img className='project-image' src={project.images} alt='project' /> : null }
			<Quote text={project.stories} />
			<div className='project-io'>
				<div className='project-inputs'>
					<h4>Inputs</h4>
					{ inputs? inputs.filter(input => input.value > 0).map(input => (
						<div key={"in_"+input.name}>
							{COSTNAMES[input.name] || input.name}: <Misc.Money precision={false} amount={input} />
						</div>
					)) : null }
				</div>
				<CharityExtraProjectOutputs outputs={outputs} />
			</div>
		</div>
	);
};

const CharityExtraProjectOutputs = ({outputs}) => {
	if ( ! outputs || ! outputs.length) return null;
	const outs = outputs.filter(o => Output.number(o));
	return (
		<div className='project-outputs'>
			<h4>Outputs</h4>
			{outs.map(output => (
				<div key={"out_"+output.name}>
					{Misc.TrPlural(Output.number(output), output.name || 'beneficiaries')}:
					{printer.prettyNumber(Output.number(output))}
				</div>
			))}
		</div>);
};


const CharityProfile = ({charity}) => {
	const allTagsString = [charity.whyTags, charity.whoTags, charity.howTags, charity.whereTags]
		.filter(tagArray => tagArray && tagArray.length)
		.join(',');
	const tags = allTagsString && (
		<div>
			<h4>Tags</h4>
			{ allTagsString.split(',').map((tag) => (
				<span key={tag}><Label>{tag.trim()}</Label> </span>
			)) }
		</div>
	);
	const turnover = charity.turnover && (
		<p>
			Turnover: { charity.turnover }
		</p>
	);
	const employees = charity.employees && (
		<p>
			Employees: { charity.employees }
		</p>
	);
	const website = charity.url && (
		<p>
			Website: <a href={charity.url} target='_blank' rel="noopener noreferrer">{charity.url}</a>
		</p>
	);
	return (<div className='CharityProfile-div'>
		<EditLink charity={charity} />
		<h4 className='CharityProfile'>Charity Profile</h4>
		<div className='col-md-12'>
			<div className='col-md-2 charity-logo-div'>
				<img src={charity.logo} responsive thumbnail className="charity-logo" />
			</div>
			<div className='col-md-7 charity-name-div'>
				<h2>{charity.displayName || charity.name}</h2>
				<br />
				<a href={'/#charity/'+charity['@id']}>{charity.id}</a>
				<p dangerouslySetInnerHTML={{ __html: printer.textToHtml(charity.description) }} />
			</div>
			<div className='col-md-3'>
				<ProjectImage images={charity.images} />
			</div>
			<div className='col-md-12 charity-data-div'>
				{ tags }
				{ turnover }
				{ employees }
				{ website }
			</div>
		</div>
	</div>);
};


// TODO only for registered editors!!!
const EditLink = ({charity}) => {
	if ( ! Login.isLoggedIn()) return null;
	const cid = NGO.id(charity);
	return (
		// <div className='pull-right'>
		// 	<a href={'#simpleedit?charityId='+escape(cid)}>edit</a>
		// </div>);
			<Button variant="outline-light" href={'#simpleedit?charityId='+escape(cid)}>Edit</Button>
	)
};

const ProjectList = ({projects, charity}) => {
	if ( ! projects) return <div />;

	const renderedProjects = projects
		.map(p => <ProjectPanel key={p.name+'-'+p.year} project={p} charity={charity} />);

	if (renderedProjects.length === 0) return <div />;

	return (
		<div>
			{ renderedProjects }
		</div>
	);
};

const COSTNAMES = { 	
	annualCosts: "Annual costs",
	fundraisingCosts: "Fundraising costs",
	tradingCosts: "Trading costs",
	incomeFromBeneficiaries: "Income from beneficiaries"
};

const ProjectPanel = ({project}) => {
	Project.assIsa(project);
	const outputs = project.outputs || [];
	const inputs = project.inputs || [];
	return (
		<div className="col-md-12 ProjectPanel">
			<div className='charity-project-title-div'>
				<h4 className='project-name'>{project.name}: {project.year}</h4>
				<p className='project-description'>{project.description}</p>
			</div>
			<div className='charity-project-div'>
				<div className='image-and-story-div'>
					<div className='col-md-2 project-image'>
						<ProjectImage images={project.images || project.image} title={project.imageCaption} />
					</div>
					<div className='col-md-offset-1 col-md-7 project-story'>
						<p className='project-story-text' dangerouslySetInnerHTML={{ __html: printer.textToHtml(project.stories) }} />
					</div>
				</div>
				<div className='upper-margin col-md-offset-2 col-md-8 inputs-outputs'>
					<div className='col-md-6 inputs'><h4>Inputs</h4>
						{inputs.map(input => <div key={"in_"+input.name}>{COSTNAMES[input.name] || input.name}: <Misc.Money precision={false} amount={input} /></div>)}
					</div>
					<div className='col-md-6 outputs'><h4>Outputs</h4>
						{outputs.map(output => <div key={"out_"+output.name}>{Misc.TrPlural(output.number, output.name)}: {printer.prettyNumber(output.number)}</div>)}
					</div>
				</div>
				<div className='upper-padding'>
					<div className='col-md-offset-2 col-md-8 comments'>
						{project.adjustmentComment}
						{project.analysisComment}
					</div>
				</div>
				<Citations thing={project} />
			</div>
		</div>
	);
};

const ProjectImage = ({images, title}) => {
	if ( ! yessy(images)) return null;
	let image = _.isArray(images)? images[0] : images;
	return <div><center><img src={image} title={title} className='project-image'/></center></div>;
};

/**
 * copy paste modify from EditFundraiserPage
 */
const LogOffSiteDonation = ({item}) => {
	if ( ! item) return null; // probably its loading
	if ( ! Login.isLoggedIn()) return null;
	NGO.assIsa(item, "LogOffSiteDonation");
	return (
		<Misc.Card title='Add an off-site donation'>
			<p>Use this form to record a donation which has already been paid for elsewhere.
				It will be added to your profile dashboard.</p>
			<DonateButton item={item} paidElsewhere />
		</Misc.Card>
	);
};

const MakeDirectFundRaiser = ({charity}) => {
	if ( ! charity) return null;
	if ( ! Login.isLoggedIn()) return null;
	NGO.assIsa(charity);
	return (<Misc.Card title='Create a Fundraiser'>
		<p>Create a fresh Fundraiser, for you to raise money for this charity
		(do not use this if you want a fund-raiser as part of an event).</p>
		<CreateButton type={C.TYPES.FundRaiser} navpage='editFundraiser' />
	</Misc.Card>);
};

const LearnAboutRatingsModal = () => {
	const [ratingsModalOpen, setRatingsModalOpen] = React.useState(false);
	const toggle = () => setRatingsModalOpen(!ratingsModalOpen)

	return (
		<>
			<button onClick={toggle} className="ratings-button">Learn about our ratings</button>
			<Modal isOpen={ratingsModalOpen} toggle={toggle}>
				<ModalHeader toggle={toggle}>Our ratings</ModalHeader>
				<ModalBody>
					<ul>
						<li>When we describe an organisation as <b>Gold</b>-rated, we mean that the organisation's work likely outperforms that of a Silver-rated organisation, and likely outperforms a Bronze-rated organisation by a substantial margin, as assessed considering cost-effectiveness and evidence of effectiveness. A gold charity is an outperformer.</li>
						<li>When we describe an organisation as <b>Silver</b>-rated, we mean that the organisation's work likely outperforms that of a Bronze-rated organisation, typically by a substantial margin, but underperforms compared to a Gold-rated organisation. A silver charity is an outperformer.</li>
						<li>When we describe an organisation as <b>Bronze</b>-rated, we mean that that the organisation's work likely has a positive impact, but underperforms compared to a Silver or Gold-rated charity. A Bronze-rated organisation may underperform a silver charity by a substantial margin. By assigning a charity or organisation a Bronze rating, we are not guaranteeing that the organisation does have net positive impact, however we are expressing confidence that the charity's impact underperforms our Gold Standard Benchmarks</li>
					</ul>
				</ModalBody>
			</Modal>
		</>
	)
}


export default CharityPage;
