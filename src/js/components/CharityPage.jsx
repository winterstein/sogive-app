// @Flow
import React from 'react';
import MDText from '../base/components/MDText'
import _ from 'lodash';
import {assert} from 'sjtest';
import {yessy, encURI} from 'wwutils';
import { Tabs, Tab, Button, Panel, Image, Well, Label } from 'react-bootstrap';
import Roles from '../base/Roles';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import printer from '../base/utils/printer';
import C from '../C';
import NGO from '../data/charity/NGO2';
import Project from '../data/charity/Project';
import Output from '../data/charity/Output';
import Citation from '../data/charity/Citation';
import Misc from '../base/components/Misc';
import Login from 'you-again';
import DonationWizard, {DonateButton} from './DonationWizard';
import CharityPageImpactAndDonate from './CharityPageImpactAndDonate';
import SocialShare from './SocialShare';
import {CreateButton} from '../base/components/ListLoad';

const CharityPage = () => {
	// fetch data
	let cid = DataStore.getUrlValue('charityId');
	let {value:charity} = DataStore.fetch(DataStore.getPath(C.KStatus.PUBLISHED, C.TYPES.$NGO(), cid), 
		() => ServerIO.getCharity(cid, C.KStatus.PUBLISHED).then(result => result.cargo)
	);
	if ( ! charity) {
		return <Misc.Loading />;
	}	

	const impactColumn = (
		<div className='col-md-7 col-xs-12 column impact-column'>
			<div className='header'>
				<h1 className='charity-name'>
					{charity.displayName || charity.name} <small><EditLink charity={charity} /></small>
				</h1>
				<CharityTags className='why-tags' tagsString={charity.whyTags} />
				<CharityTags className='where-tags' tagsString={charity.whereTags} />
			</div>
			<CharityDonate charity={charity} />
		</div>
	);
	const spacerColumn = <div className='col-md-1 hidden-xs' />;
	const infoColumn = (
		<div className='col-md-4 col-xs-12 column info-column'>
			<div className='header'>&nbsp;</div>
			<Tabs defaultActiveKey={1} id='rhsTabs'>
				<Tab eventKey={1} title='About'>
					<CharityAbout charity={charity} />
				</Tab>
				<Tab eventKey={2} title='Extra Info'>
					<CharityExtra charity={charity} />
					<LogOffSiteDonation item={charity} />
					<MakeDirectFundRaiser charity={charity} />
				</Tab>
			</Tabs>
		</div>
	);

	return (
		<div>
			<div className='top-bands'>
				<div className='band1' />
				<div className='band2' />
				<div className='band3' />
			</div>
			<div className='charity-page row'>
				{impactColumn}
				{spacerColumn}
				{infoColumn}				
			</div>						
		</div>
	);
}; // ./CharityPage


const CharityTags = ({className, tagsString = ''}) => (
	// should tags be lower-cased??
	// TODO <a href={'/#search?q=tag:'+encURI(tag)}> -- needs server-side support
	<h3 className={'tags ' + className}>
		{
			tagsString.split(/,\s*/g)
				.map(tag => <span key={tag}>{tag} </span>)
		}
	</h3>
);


const CharityDonate = ({charity}) => (
	<div className='donation-column'>
		<CharityPageImpactAndDonate charity={charity} />
		<SocialShare charity={charity} />
	</div>
);


const CharityAbout = ({charity}) => {
	// Safety: in case the url is e.g. wwww.mysite.com with no http(s)
	let churl = charity.url;
	if (churl && churl.indexOf('http') !== 0) churl = 'http://'+churl;
	return (
		<div className='charity-about'>
			{NGO.getName(charity) !== NGO.displayName(charity)? <h4 className='official-name'>{NGO.getName(charity)}</h4> : null}
			<CharityAboutImage charity={charity} />
			<div className='descriptions'>
				<div className='description-short'>
					{charity.summaryDescription? <MDText source={charity.summaryDescription} /> : null}
				</div>
				<div className='description-long'>
					{charity.description? <MDText source={charity.description} /> : null}
				</div>
			</div>
			<div className='url'>
				<a href={churl} target='_blank'>{charity.url}</a>
			</div>
			<div className='official-details'>
				{NGO.registrationNumbers(charity).map(reg => <small key={reg.id}>{reg.regulator}: {reg.id}</small>)}				
			</div>
		</div>
	);
};
const CharityAboutImage = ({charity}) => {
	if ( ! NGO.image(charity) && ! charity.logo) return null;
	return (<div className='images'>
		{NGO.image(charity)? <div className='charity-image'>
			<img src={NGO.image(charity)} alt='Charity' />
		</div> : null}
		{charity.logo? <div className='charity-logo'>
			<img src={charity.logo} alt='Charity logo' />
		</div> : null}
	</div>);
};

/**
 * The charity extra tab
 */
const CharityExtra = ({charity}) => {
	if (!charity || !charity.projects || !charity.projects.length) return null;
	const projectsByYear = {};
	(charity.projects).forEach(project => {
		const projectsForYear = projectsByYear[project.year] || [];
		if (Project.isOverall(project)) {
			projectsForYear.unshift(project);
		} else {
			projectsForYear.push(project);
		}
		projectsByYear[project.year] = projectsForYear;
	});

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
			{citations.map((ref,i) => <Cite i={i} key={i} citation={ref}/>)}
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
				<Image src={charity.logo} responsive thumbnail className="charity-logo" />
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
	// HACK: clear the datastore before viewing, so that we load the draft
	// TODO replace once the git branch feature/refactor-crud-data-draft-DW-may-2018 is complete
	return (<div className='pull-right'>
		<a href={'#simpleedit?charityId='+escape(cid)} 
			onClick={() => {
				// Trying in Edit page instead
				// DataStore.setValue(DataStore.getPath(charity), null, false);
				// ServerIO.getCharity(cid, C.KStatus.DRAFT);
			}}
		>
			edit
		</a>
	</div>);
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
		<div className='col-md-12 ProjectPanel'>
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
 * 
 copy paste modify from EditFundraiserPage
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
	return (<Misc.Card title='Create a Fund-raiser'>
		Create a Fund-Raiser for you to raise money for this charity
		(do not use this if you want a fund-raiser as part of an event)
		<CreateButton type={C.TYPES.FundRaiser} />
	</Misc.Card>);
};

export default CharityPage;
