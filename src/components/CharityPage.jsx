// @Flow
import React from 'react';
import _ from 'lodash';
import {assert} from 'sjtest';
import {yessy} from 'wwutils';
import { Panel, Image, Well, Label } from 'react-bootstrap';

import ServerIO from '../plumbing/ServerIO';
import printer from '../utils/printer';
import C from '../C';
import NGO from '../data/charity/NGO';
import Project from '../data/charity/Project';
import Misc from './Misc';

import DonationForm from './DonationForm';
import PageMetaInfo from './PageMetaInfo';

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
		let oldProjects = _.filter(projectProjects, p => p.year !== overall.year);
		let currentProjects = _.filter(projectProjects, p => p.year === overall.year);
		// sort by cost, biggest first
		currentProjects = _.sortBy(currentProjects, p => {
			let annualCost = _.find(p.inputs, pi => pi.name==='annualCosts');
			return annualCost? -annualCost.value : 0;
		});

		// page pieces
		const tags = charity.tags && (
			<div>
				<h4>Tags</h4>
				{ charity.tags.split('&').map((tag) => (
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
		const website = charity.website && (
			<p>
				Website: <a href={charity.url} target='_blank' rel="noopener noreferrer">{charity.url}</a>
			</p>
		);
		// TODO not if there's only overall		
		const projectsDiv = yessy(currentProjects)? <div><h2>Projects</h2><ProjectList projects={currentProjects} charity={charity} /></div> : null;
		const oldProjectsDiv = yessy(oldProjects)? <div><h2>Old Projects</h2><ProjectList projects={oldProjects} charity={charity} /></div> : null;
		const overallDiv = <ProjectPanel project={overall} charity={charity} />;		
		// put it together
		return (
			<div className='page CharityPage'>
				<PageMetaInfo charity={charity} />
				<Panel header={<h2>Charity Profile</h2>}>
					<Image src={charity.logo} responsive thumbnail className="pull-right" />
					<h2>{charity.name}</h2>

					<div ><small><a href={'/#charity/'+charity['@id']}>{charity.id}</a></small></div>
					<p>{charity.description}</p>
					{ tags }
					{ turnover }
					{ employees }
					{ website }
				</Panel>
				<Panel bsStyle='primary' header={<h2>Donate to { charity.name }</h2>}>
					<DonationForm charity={charity} project={NGO.getProject(charity)} />
				</Panel>
				{overallDiv}
				{projectsDiv}
				{oldProjectsDiv}
			</div>
		);
	}
} // ./CharityPage


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
	const outputs = project.outputs || [];
	const inputs = project.inputs || [];
	return (<Panel header={<h3>{project.name} {project.year}</h3>}>
		<p dangerouslySetInnerHTML={{ __html: project.stories }} />
		<div className='inputs'><h4>Inputs</h4>
			{inputs.map(output => <div key={"in_"+output.name}>{COSTNAMES[output.name] || output.name}: <Misc.Money precision={false} amount={output}/></div>)}
		</div>
		<div className='outputs'><h4>Outputs</h4>
			{outputs.map(output => <div key={"out_"+output.name}>{output.name}: {printer.prettyNumber(output.number)}</div>)}
		</div>
		<Citations thing={project} />
	</Panel>);
};


const Citations = ({thing}) => {
	let dsrc = thing['data-src'];
	if ( ! dsrc) return null;
	if (_.isArray(dsrc)) {
		if (dsrc.length > 1) {
			return <div>Sources:<ul>{dsrc.map(ds => <Citation citation={ds} />)}</ul></div>;
		}
		dsrc = dsrc[0];
	}
	return <div>Source: <Citation citation={dsrc} /></div>;	
};
const Citation = ({citation}) => {
	if (_.isString(citation)) return <p>{citation}</p>;
	return <a href={citation.url}>{citation.name || citation.url}</a>;
};

export default CharityPage;
