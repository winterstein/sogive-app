// @Flow
import React from 'react';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';
import {assert} from 'sjtest';
import {yessy, encURI} from 'wwutils';
import { Tabs, Tab, Button, Panel, Image, Well, Label } from 'react-bootstrap';

import ServerIO from '../plumbing/ServerIO';
import DataStore from '../plumbing/DataStore';
import printer from '../utils/printer';
import C from '../C';
import NGO from '../data/charity/NGO';
import Project from '../data/charity/Project';
import MonetaryAmount from '../data/charity/MonetaryAmount';
import Misc from './Misc';
import Login from 'you-again';
import DonationForm from './DonationForm';
import {impactCalc} from './ImpactWidgetry.jsx';
import SocialShare from './SocialShare';

class CharityPage extends React.Component {

	constructor(...params) {
		super(...params);
		this.state = {
		};
	}

	componentWillMount() {
		// fetch
		let cid = this.props.charityId;
		ServerIO.getCharity(cid)
		.then(function(result) {
			let charity = result.cargo;
			assert(NGO.isa(charity), charity);
			this.setState({charity: charity});
			return result;
		}.bind(this));
	}

	render() {
		const charity = this.state.charity;
		if ( ! charity) {
			return <Misc.Loading />;
		}
		let allprojects = charity.projects;
		// split out overall vs projects
		const overalls = _.filter(allprojects, p => Project.name(p) === 'overall');
		let projectProjects = _.filter(allprojects, p => Project.name(p) !== 'overall');
		// latest only
		const overall = Project.getLatest(overalls);
		const year = overall? overall.year : 0;
		let oldProjects = _.filter(projectProjects, p => p.year !== overall.year);
		let currentProjects = _.filter(projectProjects, p => p.year === overall.year);
		// sort by cost, biggest first
		currentProjects = _.sortBy(currentProjects, p => {
			let annualCost = _.find(p.inputs, pi => pi.name==='annualCosts');
			return annualCost? -annualCost.value : 0;
		});

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
	}
} // ./CharityPage


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
		<DonationForm charity={charity} />
		<SocialShare charity={charity} />
	</div>
);


const CharityAbout = ({charity}) => {
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
	return (
		<div className='charity-about'>
			{NGO.name(charity) !== NGO.displayName(charity)? <h4 className='official-name'>{NGO.name(charity)}</h4> : null}
			<div className='images'>
				{NGO.image(charity)? <div className='charity-image'>
					<img src={NGO.image(charity)} alt='Charity' />
				</div> : null}
				{charity.logo? <div className='charity-logo'>
					<img src={charity.logo} alt='Charity logo' />
				</div> : null}
			</div>
			<div className='descriptions'>
				<div className='description-short'>
					{charity.summaryDescription? <ReactMarkdown source={charity.summaryDescription} /> : null}
				</div>
				<p className='description-long'>
					{charity.description? <ReactMarkdown source={charity.description} /> : null}
				</p>
			</div>
			<div className='url'>
				<a href={charity.url}>{charity.url}</a>
			</div>
			<div className='official-details'>
				{NGO.registrationNumbers(charity).map(reg => <small>{reg.regulator}: {reg.id}</small>)}				
			</div>
		</div>	
	);
};

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

	const yearDivs = Object.keys(projectsByYear).sort().map(year => (
		<CharityExtraYear key={year} year={year} projects={projectsByYear[year]} />
	));
	let refs = NGO.getCitations(charity);
	return (
		<div className='charity-extra'>
			{yearDivs}
			{refs.length? <Citations citations={refs} /> : null}
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
		<a href={citation.url} target='_blank'>{citation.url}</a>
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

const CharityExtraProject = ({project, showTitle}) => {
	if ( ! project) return null;
	const {inputs, outputs} = project;

	/* Markdown swallows single line breaks - but normal people processing text don't expect this!
	Using a regex to normalise all strings of CRs to \n\n before sending to printer so the story formatting behaves more intuitively for now. */
	let stories = '';
	if (project.stories && project.stories.replace) {
		window.story = project.stories;

		const storiesProcessed = project.stories.replace(/\n+/g, '\n\n');
		stories = (
			<p className='project-stories'>
				<span className='quote fa fa-quote-left' /> <span dangerouslySetInnerHTML={{ __html: printer.textToHtml(storiesProcessed) }} /> <span className='quote fa fa-quote-right' />
			</p>
		);
	}


	return (
		<div className='extra-project'>
			{ showTitle ? <h3 className='project-name'>{project.name}</h3> : null }
			{ project-images ? <img className='project-image' src={project.images} alt='project' /> : null }
			{ stories }
			<div className='project-io'>
				<div className='project-inputs'>
					<h4>Inputs</h4>
					{ inputs? inputs.filter(input => input.value > 0).map(input => (
						<div key={"in_"+input.name}>
							{COSTNAMES[input.name] || input.name}: <Misc.Money precision={false} amount={input} />
						</div>
					)) : null }
				</div>
				<div className='project-outputs'>
					<h4>Outputs</h4>
					{ outputs? outputs.map(output => (
						<div key={"out_"+output.name}>
							{Misc.TrPlural(output.number, output.name)}: {printer.prettyNumber(output.number)}
						</div>
					)) : null }
				</div>
			</div>
		</div>
	);
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
const EditLink = ({charity}) => Login.isLoggedIn()? <div className='pull-right'><a href={'#edit?charityId='+charity['@id']}>edit</a></div> : null;

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

export default CharityPage;
